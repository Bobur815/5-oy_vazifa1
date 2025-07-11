import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentDto, UpdateCommentDto } from './dto/dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  beforeEach(async () => {
    const serviceMock = {
      getAll: jest.fn(),
      createComment: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  describe('getAll', () => {
    it('barcha commentlarni qaytarishi kerak', async () => {
      const result = [{ id: '1' }];
      (service.getAll as jest.Mock).mockResolvedValue(result);

      expect(await controller.getAll()).toBe(result);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('createComment', () => {
    it('comment yaratishni chaqirishi va natijani qaytarishi kerak', async () => {
      const payload: CommentDto[] = [{ userId: 'u1', postId: 'p1', body: 'text' }];
      const result = { message: '1 comments successfully created' };
      (service.createComment as jest.Mock).mockResolvedValue(result);

      expect(await controller.createComment(payload)).toBe(result);
      expect(service.createComment).toHaveBeenCalledWith(payload);
    });
  });

  describe('updateComment', () => {
    it('comment yangilashni chaqirishi va natijani qaytarishi kerak', async () => {
      const id = 'c1';
      const payload: UpdateCommentDto = { userId: 'u1', postId: 'p1', body: 'upd' };
      const result = { message: 'updated', data: {} };
      (service.updateComment as jest.Mock).mockResolvedValue(result);

      expect(await controller.updateComment(id, payload)).toBe(result);
      expect(service.updateComment).toHaveBeenCalledWith(id, payload);
    });
  });

  describe('deleteComment', () => {
    it('comment o‘chirishni chaqirishi va natijani qaytarishi kerak', async () => {
      const id = 'c1';
      const result = 'deleted';
      (service.deleteComment as jest.Mock).mockResolvedValue(result);

      expect(await controller.deleteComment(id)).toBe(result);
      expect(service.deleteComment).toHaveBeenCalledWith(id);
    });
  });
});
