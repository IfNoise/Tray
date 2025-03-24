import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TrayService } from './tray.service';
import { UnauthorizedException } from '@nestjs/common';
import { CurrentUserId } from 'src/auth/current-user.decorator';
import { AddPlantInput } from './dto/add-plants.input';

@Resolver('Tray')
export class TrayResolver {
  constructor(private readonly trayService: TrayService) {}

  @Query('tray')
  async findAll(@CurrentUserId() userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authorization required');
    }

    return this.trayService.findAll(userId);
  }

  @Mutation('addPlant')
  async addPlant(
    @Args('plants') addPlantInput: AddPlantInput,
    @CurrentUserId() userId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authorization required');
    }

    return this.trayService.addPlant(userId, addPlantInput);
  }

  @Mutation('cleanTray')
  async cleanTray(@CurrentUserId() userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authorization required');
    }

    return this.trayService.cleanTray(userId);
  }
}
