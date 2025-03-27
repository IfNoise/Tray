import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3080);
  logger.log('Application is running on: http://localhost:3080');
}
bootstrap();
