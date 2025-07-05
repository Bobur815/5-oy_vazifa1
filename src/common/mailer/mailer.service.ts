import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService} from "@nestjs-modules/mailer"
import { RegisterDto } from 'src/core/modules/auth/dto/dto';

@Injectable()
export class AppMailerService {
    constructor(private readonly mailerService: NestMailerService){}

    async sendVerificationCode(to: string, user: RegisterDto, code: number) {
        return this.mailerService.sendMail({
          to,
          subject: 'Verify your email',
          template: 'index',
          context: { 
            username: user.name,
            code,
            expiresIn: 15,
            year: new Date().getFullYear(),
            },
        });
    }

    async sendPasswordResetCode(email: string, code: number) {
        return this.mailerService.sendMail({
          to: email,
          subject: 'Your Password Reset Code',
          template: 'reset-password', 
          context: {
            code,
            expiresIn: 15,             
            year: new Date().getFullYear()
          },
        });
      }
}
