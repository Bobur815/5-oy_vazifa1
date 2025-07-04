import { Module } from '@nestjs/common';
import { PrismaModule } from './core/database/prisma.module';
import { UsersModule } from './core/modules/users/users.module';
import { AuthModule } from './core/modules/auth/auth.module';
import { CommentsModule } from './core/modules/comments/comments.module';
import { PostsModule } from './core/modules/posts/posts.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, PostsModule, CommentsModule],
})
export class AppModule {}
