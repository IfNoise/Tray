import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TrayService } from './tray.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user.decorator';
import { AddPlantInput } from './dto/add-plants.input';
import { GraphqlAuthGuard } from '../auth/guard/graphql-auth.guard';

@Resolver('Tray')
@UseGuards(GraphqlAuthGuard)
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
    @Args('addPlant') addPlantInput: AddPlantInput, // Изменено с 'plants' на 'addPlant'
    @CurrentUserId() userId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(`Authorization required ${userId}`);
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
