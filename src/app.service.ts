import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');
  getHello(): string {
    this.logger.log('Hello World!');
    return 'Hello World!';
  }
}
