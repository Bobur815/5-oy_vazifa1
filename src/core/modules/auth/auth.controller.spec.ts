import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CreateUserWithPostDto} from './dto/dto';
import { VerificationDto } from './dto/verification.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const serviceMock = {
      register: jest.fn(),
      registerUserWithPost: jest.fn(),
      verify: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('authService.register funksiyasini chaqirishi va javob qaytarishi kerak', async () => {
      const payload: RegisterDto = { name: 'Bobur', email: 'bobur@gmail.com', password: 'pwd', age: 32 };
      const result = { message: 'ok' };
      (service.register as jest.Mock).mockResolvedValue(result);

      expect(await controller.register(payload)).toBe(result);
      expect(service.register).toHaveBeenCalledWith(payload);
    });
  });

  describe('registerUserWithPost', () => {
    it('authService.registerUserWithPost funksiyasini chaqirishi va javob qaytarishi kerak', async () => {
      const payload: CreateUserWithPostDto = {
        name: 'Bobur',
        email: 'bobur@gmail.com',
        age: 32,
        password: 'pwd',
        postTitle: 'Hello',
        postBody: 'World',
      };
      const result = { message: 'created', user: {}, post: {} };
      (service.registerUserWithPost as jest.Mock).mockResolvedValue(result);

      expect(await controller.registerUserWithPost(payload)).toBe(result);
      expect(service.registerUserWithPost).toHaveBeenCalledWith(payload);
    });
  });

  describe('verify', () => {
    it('authService.verify funksiyasini chaqirishi va javob qaytarishi kerak', async () => {
      const payload: VerificationDto = { email: 'bobur@gmail.com', code: 123456 };
      const result = { success: true };
      (service.verify as jest.Mock).mockResolvedValue(result);

      expect(await controller.verify(payload)).toBe(result);
      expect(service.verify).toHaveBeenCalledWith(payload);
    });
  });

  describe('login', () => {
    it('authService.login funksiyasini chaqirishi va javob qaytarishi kerak', async () => {
      const payload: LoginDto = { email: 'bobur@gmail.com', password: 'pwd' };
      const result = { message: 'ok', accesToken: 'token' };
      (service.login as jest.Mock).mockResolvedValue(result);

      expect(await controller.login(payload)).toBe(result);
      expect(service.login).toHaveBeenCalledWith(payload);
    });
  });
});
