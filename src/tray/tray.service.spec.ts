import { Test, TestingModule } from '@nestjs/testing';
import { TrayService } from './tray.service';

describe('TrayService', () => {
  let service: TrayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrayService],
    }).compile();

    service = module.get<TrayService>(TrayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
