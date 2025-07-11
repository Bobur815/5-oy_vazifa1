import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserDto } from './dto/dto';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        aggregate: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getAll', () => {
    it('barcha userlarni qaytarishi kerak', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.getAll();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
      });
      expect(result).toBe(users);
    });
  });

  describe('getSingle', () => {
    it('id bo‘yicha userni qaytarishi kerak', async () => {
      const user = { id: '1', name: 'Bobur' };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);

      const result = await service.getSingle('1');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual(user);
    });
  });

  describe('getAggregateAge', () => {
    it('yosh bo‘yicha agregatni qaytarishi kerak', async () => {
      const agg = { _avg: { age: 30 }, _min: { age: 20 }, _max: { age: 40 } };
      (prisma.user.aggregate as jest.Mock).mockResolvedValue(agg);

      const result = await service.getAggregateAge();
      expect(prisma.user.aggregate).toHaveBeenCalledWith({
        _avg: { age: true },
        _min: { age: true },
        _max: { age: true },
      });
      expect(result).toEqual({ averageAge: 30, minAge: 20, maxAge: 40 });
    });
  });

  describe('updateUser', () => {
    it('topilmasa xato tashlashi kerak', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.updateUser('1', {} as UserDto)).rejects.toThrow(NotFoundException);
    });

    it('mavjud userni yangilashi kerak', async () => {
      const existing = { id: '1' };
      const updated = { id: '1', name: 'New' };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(existing);
      (prisma.user.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateUser('1', { name: 'New' } as UserDto);
      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'New' } });
      expect(result).toEqual({ message: 'User updated successfully', date: updated });
    });
  });

  describe('deleteUser', () => {
    it('topilmasa xato tashlashi kerak', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteUser('1')).rejects.toThrow(NotFoundException);
    });

    it('mavjud userni o‘chirishi va xabar qaytarishi kerak', async () => {
      const existing = { id: '1' };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(existing);
      (prisma.user.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.deleteUser('1');
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe('User deleted successfully');
    });
  });
});
