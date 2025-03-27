import { Module } from '@nestjs/common';
import { TrayService } from './tray.service';
import { TrayResolver } from './tray.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { TrayModel, TraySchema } from './schemas/tray.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: TrayModel.name, schema: TraySchema }]),
  ],
  providers: [TrayResolver, TrayService],
  exports: [TrayService],
})
export class TrayModule {}
