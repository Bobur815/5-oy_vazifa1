import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserDto } from './dto/dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const serviceMock = {
      getAll: jest.fn(),
      getAggregateAge: jest.fn(),
      getSingle: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('getAll', () => {
    it('barcha userlarni qaytarishi kerak', async () => {
      const result = [{ id: '1' }];
      (service.getAll as jest.Mock).mockResolvedValue(result);

      expect(await controller.getAll()).toBe(result);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('getAggregateAge', () => {
    it('yosh agregatini qaytarishi kerak', async () => {
      const result = { averageAge: 30, minAge: 20, maxAge: 40 };
      (service.getAggregateAge as jest.Mock).mockResolvedValue(result);

      expect(await controller.getAggregateAge()).toBe(result);
      expect(service.getAggregateAge).toHaveBeenCalled();
    });
  });

  describe('getSingle', () => {
    it('id bo‘yicha userni qaytarishi kerak', async () => {
      const result = { id: '1' };
      (service.getSingle as jest.Mock).mockResolvedValue(result);

      expect(await controller.getSingle('1')).toBe(result);
      expect(service.getSingle).toHaveBeenCalledWith('1');
    });
  });

  describe('updateUser', () => {
    it('userni yangilashi va natijani qaytarishi kerak', async () => {
      const dto: UserDto = { name: 'New', email: 'a@b.c', age: 30, password: '****' };
      const result = { message: 'updated', date: {} };
      (service.updateUser as jest.Mock).mockResolvedValue(result);

      expect(await controller.updateUser('1', dto)).toBe(result);
      expect(service.updateUser).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('deleteUser', () => {
    it('userni o‘chirishi va xabar qaytarishi kerak', async () => {
      const result = 'deleted';
      (service.deleteUser as jest.Mock).mockResolvedValue(result);

      expect(await controller.deleteUser('1')).toBe(result);
      expect(service.deleteUser).toHaveBeenCalledWith('1');
    });
  });
});
