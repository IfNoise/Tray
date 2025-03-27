import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenService } from '../token.service';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const token = req.headers['x-access-token'];

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const decodedToken = this.tokenService.decodeToken(token);
      // Проверка наличия sub в токене
      if (!decodedToken || !decodedToken.sub) {
        throw new UnauthorizedException('Invalid token structure');
      }

      // Добавляем данные пользователя в запрос
      req.userId = decodedToken.sub;

      // Проверка наличия ролей (если они нужны)
      if (
        decodedToken.resource_access &&
        decodedToken.resource_access['oauth2-proxy'] &&
        decodedToken.resource_access['oauth2-proxy'].roles
      ) {
        req.roles = decodedToken.resource_access['oauth2-proxy'].roles;
      } else {
        req.roles = [];
      }

      return true;
    } catch (error) {
      console.error('Invalid token', error);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
