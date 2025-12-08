/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './services/mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SENDGRID_HOST,
        port: Number(process.env.SENDGRID_PORT),
        secure: true,
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASS,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM}>`,
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class CommonModule {}
