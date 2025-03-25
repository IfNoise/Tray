import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {} //

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
