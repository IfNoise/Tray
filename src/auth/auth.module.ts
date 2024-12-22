import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key', // Замените на ваш секретный ключ
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class AuthModule {}
