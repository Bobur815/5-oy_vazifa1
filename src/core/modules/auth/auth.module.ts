import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports:[RedisModule,JwtModule,MailerModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
