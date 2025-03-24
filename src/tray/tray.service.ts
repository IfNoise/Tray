import { Injectable } from '@nestjs/common';
import { AddPlantInput } from './dto/add-plants.input';

@Injectable()
export class TrayService {
  // Для примера используем in-memory хранилище, в реальном приложении здесь будет БД
  private trays: Map<string, { userId: string; plants: string[] }> = new Map();

  findAll(userId: string) {
    const userTray = this.trays.get(userId);
    return userTray ? [userTray] : [];
  }

  addPlant(userId: string, addPlantInput: AddPlantInput) {
    let userTray = this.trays.get(userId);

    if (!userTray) {
      userTray = { userId, plants: [] };
      this.trays.set(userId, userTray);
    }

    userTray.plants = [...userTray.plants, ...addPlantInput.plants];
    return userTray;
  }

  cleanTray(userId: string) {
    const userTray = this.trays.get(userId);
    if (userTray) {
      userTray.plants = [];
    }
    return userTray || { userId, plants: [] };
  }
}
