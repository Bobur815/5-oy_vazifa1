import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from 'src/core/database/prisma.service';
import { CommentDto, UpdateCommentDto } from './dto/dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      comment: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: { findUnique: jest.fn() },
      post: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getAll', () => {
    it('commentlarni qaytarishi kerak', async () => {
      const comments = [{ id: '1' }, { id: '2' }];
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(comments);

      const result = await service.getAll();
      expect(prisma.comment.findMany).toHaveBeenCalled();
      expect(result).toBe(comments);
    });
  });

  describe('createComment', () => {
    const validPayload: CommentDto[] = [
      { userId: 'u1', postId: 'p1', body: 'hello' },
      { userId: 'u2', postId: 'p2', body: 'world' },
    ];

    it("To'g'ri ma'lumot kelmasa NotFoundException otishi kerak", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createComment(validPayload)).rejects.toThrow(NotFoundException);
    });

    it('comment yaratish', async () => {
      // First entry valid, second invalid
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'u1' })
        .mockResolvedValueOnce(null);
      (prisma.post.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'p1' })
        .mockResolvedValueOnce(null);
      (prisma.comment.createMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.createComment(validPayload);
      expect(prisma.comment.createMany).toHaveBeenCalledWith({ data: [validPayload[0]] });
      expect(result).toEqual({ message: '1 comments successfully created' });
    });
  });

  describe('updateComment', () => {
    const commentId = 'c1';
    const updateDto: UpdateCommentDto = { userId: 'u1', postId: 'p1', body: 'updated' };

    it("comment yo'q bo'lsa NotFoundException tashlash", async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.updateComment(commentId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('commentni update qilish', async () => {
      const existing = { id: commentId, userId: 'u0', postId: 'p0', body: 'old' };
      const updated = { id: commentId, ...updateDto };
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(existing);
      (prisma.comment.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateComment(commentId, updateDto);
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: {
          body: updateDto.body,
          postId: updateDto.postId,
          userId: updateDto.userId,
        },
      });
      expect(result).toEqual({ message: 'comment successfully updated', data: updated });
    });
  });

  describe('deleteComment', () => {
    const commentId = 'c1';

    it("comment yo'q bo'lsa NotFoundException tashlash", async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteComment(commentId)).rejects.toThrow(NotFoundException);
    });

    it("commentni o'chirishi kerak", async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({ id: commentId });
      (prisma.comment.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.deleteComment(commentId);
      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: commentId } });
      expect(result).toBe('comment successfully deleted');
    });
  });
});
