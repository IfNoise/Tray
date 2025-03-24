import { Module } from '@nestjs/common';
import { TrayService } from './tray.service';
import { TrayResolver } from './tray.resolver';

@Module({
  providers: [TrayResolver, TrayService],
})
export class TrayModule {}
