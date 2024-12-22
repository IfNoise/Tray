import { Controller, Get, Logger, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { TokenService } from './auth/token.service';

@Controller()
export class AppController {
  private readonly logger = new Logger('AppController');
  constructor(
    private readonly appService: AppService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  getHello(@Request() req): string {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decodedToken = this.tokenService.decodeToken(token);
      this.logger.log(decodedToken);
      const userId = decodedToken['sub'];
      const roles = decodedToken['realm_access']['roles'];
      return `${userId}, ${roles}`;
    }
    return 'Authorization header missing';
    //return this.appService.getHello();
  }
}
