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
      throw new UnauthorizedException('Authorization required');
    }

    try {
      const decodedToken = this.tokenService.decodeToken(token);
      req.userId = decodedToken['sub'];
      req.roles =
        decodedToken['resource_access']['oauth2-proxy']['roles'] || [];
      return true;
    } catch (error) {
      console.error('Invalid token', error);
      return false; // или true, если хотите разрешить доступ
    }
  }
}
