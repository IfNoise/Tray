import { Injectable, Logger } from '@nestjs/common';
import { AddPlantInput } from './dto/add-plants.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrayDocument, TrayModel } from './schemas/tray.schema';

@Injectable()
export class TrayService {
  private readonly logger = new Logger(TrayService.name);

  constructor(
    @InjectModel(TrayModel.name) private trayModel: Model<TrayDocument>,
  ) {}

  async findAll(userId: string) {
    try {
      const userTray = await this.trayModel.find({ userId }).exec();
      return userTray;
    } catch (error) {
      this.logger.error(`Error finding trays for user ${userId}:`, error);
      throw error;
    }
  }

  async addPlant(userId: string, addPlantInput: AddPlantInput) {
    try {
      // Находим существующий поднос или создаем новый
      let userTray = await this.trayModel.findOne({ userId }).exec();

      if (!userTray) {
        userTray = new this.trayModel({ userId, plants: [] });
      }
      if (!userTray) {
        throw new Error('User tray not found');
      }

      // Фильтруем новые растения
      const newPlants = Array.isArray(addPlantInput.plants)
        ? addPlantInput.plants.filter(
            (plant) => !userTray.plants.includes(plant),
          )
        : [];

      // Добавляем новые растения
      if (newPlants.length > 0) {
        userTray.plants.push(...newPlants);
        await userTray.save();
      }

      return userTray;
    } catch (error) {
      this.logger.error(`Error adding plants for user ${userId}:`, error);
      throw error;
    }
  }

  async cleanTray(userId: string) {
    try {
      const userTray = await this.trayModel.findOne({ userId }).exec();

      if (userTray) {
        userTray.plants = [];
        return await userTray.save();
      }

      // Если подноса нет, создаем пустой
      // const newTray = new this.trayModel({ userId, plants: [] });
      return null;
    } catch (error) {
      this.logger.error(`Error cleaning tray for user ${userId}:`, error);
      throw error;
    }
  }
}
