import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should decode token correctly', () => {
    const mockToken = 'test.token';
    const mockDecodedToken = {
      sub: 'userId',
      resource_access: { 'oauth2-proxy': { roles: ['user'] } },
    };

    jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecodedToken);

    const result = service.decodeToken(mockToken);
    expect(result).toEqual(mockDecodedToken);
    expect(jwtService.decode).toHaveBeenCalledWith(mockToken);
  });
});
