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
    const logObject = {
      headers: req.headers,
      url: req.url,
      method: req.method,
    };
    this.logger.log(JSON.stringify(logObject, null, 2));
    const token = req.headers['x-access-token'];
    if (token) {
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
