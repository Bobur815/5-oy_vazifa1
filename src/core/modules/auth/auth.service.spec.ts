import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/core/database/prisma.service';
import { RedisService } from 'src/common/redis/redis.service';
import { AppMailerService } from 'src/common/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, CreateUserWithPostDto} from './dto/dto';
import { VerificationDto } from './dto/verification.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let redisService: RedisService;
  let mailService: AppMailerService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const prismaMock = { user: { findFirst: jest.fn(), create: jest.fn() }, $transaction: jest.fn() };
    const redisMock = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    const mailMock = { sendVerificationCode: jest.fn() };
    const jwtMock = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: AppMailerService, useValue: mailMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
    mailService = module.get<AppMailerService>(AppMailerService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('agar email mavjud bo‘lsa ConflictException tashlashi kerak', async () => {
      const payload: RegisterDto = { name: 'Bobur', email: 'bobur@gmail.com', password: '***', age: 32 };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 1, ...payload });

      await expect(service.register(payload)).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: payload.email } });
    });

    it('agar email mavjud bo‘lmasa kod yuborib, redisga yozishi va message qaytarishi kerak', async () => {
      const payload: RegisterDto = { name: 'Bobur', email: 'bobur@gmail.com', password: '***', age: 32 };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mailService.sendVerificationCode as jest.Mock).mockResolvedValue(undefined);
      (redisService.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.register(payload);

      expect(mailService.sendVerificationCode).toHaveBeenCalledWith(
        payload.email,
        payload,
        expect.any(Number)
      );
      expect(redisService.set).toHaveBeenCalledWith(
        `register:${payload.email}`,
        expect.stringContaining('"verificationCode"'),
        900
      );
      expect(result).toEqual({ message: `Verification code sent to ${payload.email}` });
    });
  });

  describe('verify', () => {
    const dto: VerificationDto = { email: 'bobur@gmail.com', code: 123456 };
    const stored = { name: 'Bobur', email: dto.email, password: '***', age: 32, verificationCode: 123456 };

    it("agar redisda ma'lumot bo'lmasa BadRequestException tashlashi kerak", async () => {
      (redisService.get as jest.Mock).mockResolvedValue(null);
      await expect(service.verify(dto)).rejects.toThrow(BadRequestException);
      expect(redisService.get).toHaveBeenCalledWith(`register:${dto.email}`);
    });

    it('agar kod mos kelmasa BadRequestException tashlashi kerak', async () => {
      (redisService.get as jest.Mock).mockResolvedValue(JSON.stringify({ ...stored, verificationCode: 654321 }));
      await expect(service.verify(dto)).rejects.toThrow(BadRequestException);
    });

    it('agar kod to‘g‘ri bo‘lsa foydalanuvchi yaratilishi va token qaytarilishi kerak', async () => {
      (redisService.get as jest.Mock).mockResolvedValue(JSON.stringify(stored));
      (redisService.del as jest.Mock).mockResolvedValue(undefined);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1, email: stored.email });
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_pw');

      const result = await service.verify(dto);

      expect(redisService.del).toHaveBeenCalledWith(`register:${dto.email}`);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: expect.objectContaining({ email: stored.email, password: 'hashed_pw' }) });
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, { id: 1, role: stored.email }, expect.any(Object));
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, { id: 1, role: stored.email }, expect.any(Object));
      expect(result).toEqual({ success: true, message: 'Registiration successfull ', tokens: { accessToken: 'access_token', refreshToken: 'refresh_token' } });
    });
  });

  describe('login', () => {
    it('agar foydalanuvchi topilmasa NotFoundException tashlashi kerak', async () => {
      const dto: LoginDto = { email: 'bobur@gmail.com', password: 'pwd' };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(NotFoundException);
    });

    it('agar parol noto‘g‘ri bo‘lsa ConflictException tashlashi kerak', async () => {
      const dto: LoginDto = { email: 'bobur@gmail.com', password: '***' };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ password: 'hash' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(service.login(dto)).rejects.toThrow(ConflictException);
    });

    it('muvaffaqiyatli login bo‘lsa token qaytarilishi kerak', async () => {
      const dto: LoginDto = { email: 'bobur@gmail.com', password: 'pwd' };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ password: 'hash' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const result = await service.login(dto);
      expect(result).toEqual({ message: 'Login successfull', accesToken: expect.any(String) });
    });
  });
});
