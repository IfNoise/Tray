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
    @Args('plants') plants: string[], // Изменено с 'addPlant' на 'plants'
    @CurrentUserId() userId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authorization required');
    }

    // Адаптируем вызов сервиса, чтобы он принимал массив строк
    return this.trayService.addPlant(userId, { plants });
  }

  @Mutation('cleanTray')
  async cleanTray(@CurrentUserId() userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authorization required');
    }

    return this.trayService.cleanTray(userId);
  }
}
