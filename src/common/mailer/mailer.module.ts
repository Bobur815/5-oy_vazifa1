import { Global, Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { AppMailerService } from './mailer.service';

@Global()
@Module({
  imports:[
    NestMailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'ergashevboburmirzo815@gmail.com',
          pass: "twnk gtcx wbae qjhm"
        }
    },
    defaults:{
      from: 'no reply <ergashevboburmirzo815@gmail.com>'
    },

    template: {
      dir: join(process.cwd(), 'src', 'common','template'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict:true
      }
    }
    }),
  ],
  providers: [AppMailerService],
  exports: [AppMailerService]
})
export class MailerModule {}
