import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenService } from './../token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const token = request.headers['x-access-token'];
    if (!token) {
      return false;
    }

    try {
      const decodedToken = this.tokenService.decodeToken(token);
      request.user = {
        userId: decodedToken['sub'],
        roles: decodedToken['resource_access']['oauth2-proxy']['roles'],
      };
      return true;
    } catch (error) {
      return false;
    }
  }
}
