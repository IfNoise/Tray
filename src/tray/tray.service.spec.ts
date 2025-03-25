import { Test, TestingModule } from '@nestjs/testing';
import { TrayService } from './tray.service';
import { getModelToken } from '@nestjs/mongoose';
import { TrayModel } from './schemas/tray.schema';
import { AddPlantInput } from './dto/add-plants.input';
import { Model } from 'mongoose';

const mockTrayModel = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
});

describe('TrayService', () => {
  let service: TrayService;
  let model: Model<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrayService,
        {
          provide: getModelToken(TrayModel.name),
          useFactory: mockTrayModel,
        },
      ],
    }).compile();

    service = module.get<TrayService>(TrayService);
    model = module.get<Model<any>>(getModelToken(TrayModel.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all trays for a user', async () => {
      const mockTrays = [{ userId: 'user1', plants: ['plant1', 'plant2'] }];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTrays),
      } as any);

      const result = await service.findAll('user1');
      expect(model.find).toHaveBeenCalledWith({ userId: 'user1' });
      expect(result).toEqual(mockTrays);
    });

    it('should throw an error when find fails', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      } as any);

      await expect(service.findAll('user1')).rejects.toThrow('DB error');
    });
  });

  describe('addPlant', () => {
    it('should add plants to an existing tray', async () => {
      const mockTray = {
        userId: 'user1',
        plants: ['plant1'],
        save: jest.fn().mockResolvedValue({
          userId: 'user1',
          plants: ['plant1', 'plant2'],
        }),
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTray),
      } as any);

      const addPlantInput: AddPlantInput = {
        plants: ['plant2'],
      };

      const result = await service.addPlant('user1', addPlantInput);
      expect(model.findOne).toHaveBeenCalledWith({ userId: 'user1' });
      expect(mockTray.plants).toContain('plant2');
      expect(mockTray.save).toHaveBeenCalled();
      expect(result.plants).toEqual(['plant1', 'plant2']);
    });

    it('should create a new tray if none exists', async () => {
      const mockNewTray = {
        userId: 'user1',
        plants: [],
        save: jest.fn().mockResolvedValue({
          userId: 'user1',
          plants: ['plant1'],
        }),
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Create a proper mock that works as both constructor and has static methods
      interface TrayModelStatic {
        findOne: jest.Mock;
      }
      const MockModel = jest
        .fn()
        .mockImplementation(() => mockNewTray) as jest.Mock & TrayModelStatic;
      MockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Replace the trayModel in the service with our mocked model
      service['trayModel'] = MockModel as unknown as Model<any>;

      const addPlantInput: AddPlantInput = {
        plants: ['plant1'],
      };

      const result = await service.addPlant('user1', addPlantInput);
      expect(MockModel.findOne).toHaveBeenCalledWith({ userId: 'user1' });
      expect(mockNewTray.plants).toContain('plant1');
      expect(mockNewTray.save).toHaveBeenCalled();
      expect(result.plants).toEqual(['plant1']);
    });

    it('should not add duplicate plants', async () => {
      const mockTray = {
        userId: 'user1',
        plants: ['plant1', 'plant2'],
        save: jest.fn().mockResolvedValue({
          userId: 'user1',
          plants: ['plant1', 'plant2'],
        }),
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTray),
      } as any);

      const addPlantInput: AddPlantInput = {
        plants: ['plant1'], // Уже существующее растение
      };

      await service.addPlant('user1', addPlantInput);
      expect(mockTray.plants).toEqual(['plant1', 'plant2']); // Без изменений
      expect(mockTray.save).not.toHaveBeenCalled();
    });
  });

  describe('cleanTray', () => {
    it('should clean a tray', async () => {
      const mockTray = {
        userId: 'user1',
        plants: ['plant1', 'plant2'],
        save: jest.fn().mockResolvedValue({
          userId: 'user1',
          plants: [],
        }),
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTray),
      } as any);

      const result = await service.cleanTray('user1');
      expect(model.findOne).toHaveBeenCalledWith({ userId: 'user1' });
      expect(mockTray.plants).toEqual([]);
      expect(mockTray.save).toHaveBeenCalled();
      expect(result.plants).toEqual([]);
    });

    it('should return null if tray does not exist', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.cleanTray('user1');
      expect(model.findOne).toHaveBeenCalledWith({ userId: 'user1' });
      expect(result).toBeNull();
    });
  });
});
