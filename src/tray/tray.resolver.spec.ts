import { Test, TestingModule } from '@nestjs/testing';
import { TrayResolver } from './tray.resolver';
import { TrayService } from './tray.service';
import { UnauthorizedException } from '@nestjs/common';
import { GraphqlAuthGuard } from '../auth/guard/graphql-auth.guard';

describe('TrayResolver', () => {
  let resolver: TrayResolver;
  let service: TrayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrayResolver,
        {
          provide: TrayService,
          useValue: {
            findAll: jest.fn(),
            addPlant: jest.fn(),
            cleanTray: jest.fn(),
          },
        },
        {
          provide: GraphqlAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    })
      .overrideGuard(GraphqlAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    resolver = module.get<TrayResolver>(TrayResolver);
    service = module.get<TrayService>(TrayService);
  });

  it('should throw UnauthorizedException when userId is not provided', async () => {
    await expect(resolver.findAll(null)).rejects.toThrow(UnauthorizedException);
    await expect(resolver.addPlant({ plants: [] }, null)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(resolver.cleanTray(null)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should call service methods with correct userId', async () => {
    const userId = 'test-user-id';
    const mockResult = [{ id: 1, name: 'test', _id: 'mockId', __v: 0 }] as any;

    jest.spyOn(service, 'findAll').mockResolvedValue(mockResult);
    const findAllResult = await resolver.findAll(userId);
    expect(service.findAll).toHaveBeenCalledWith(userId);
    expect(findAllResult).toEqual(mockResult);

    const addPlantInput = { plants: ['plant1', 'plant2'] };
    const mockTrayDocument = {
      _id: 'mockId',
      userId: userId,
      plants: ['plant1', 'plant2'],
      __v: 0,
    } as any; // Using 'any' to satisfy the complex document type
    jest.spyOn(service, 'addPlant').mockResolvedValue(mockTrayDocument);
    const addPlantResult = await resolver.addPlant(addPlantInput, userId);
    expect(service.addPlant).toHaveBeenCalledWith(userId, addPlantInput);
    expect(addPlantResult).toEqual(mockTrayDocument);

    const mockEmptyTrayDocument = {
      _id: 'mockId',
      userId: userId,
      plants: [],
      __v: 0,
    } as any; // Using 'any' to satisfy the complex document type
    jest.spyOn(service, 'cleanTray').mockResolvedValue(mockEmptyTrayDocument);
    const cleanTrayResult = await resolver.cleanTray(userId);
    expect(service.cleanTray).toHaveBeenCalledWith(userId);
    expect(cleanTrayResult).toEqual(mockEmptyTrayDocument);
  });
});
