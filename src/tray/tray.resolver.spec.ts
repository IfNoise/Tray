import { Test, TestingModule } from '@nestjs/testing';
import { TrayResolver } from './tray.resolver';
import { TrayService } from './tray.service';

describe('TrayResolver', () => {
  let resolver: TrayResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrayResolver, TrayService],
    }).compile();

    resolver = module.get<TrayResolver>(TrayResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
