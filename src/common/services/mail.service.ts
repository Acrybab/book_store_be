/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { SendHTMLEmail } from '../types';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT')) || 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'), // Sửa từ SMTP_PASSWORD thành SMTP_PASS
      },
      tls: {
        // Không từ chối chứng chỉ không hợp lệ (hữu ích khi chạy trên server)
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10 giây
    });
  }

  async sendHTMLEmail({ to, subject, htmlContent }: SendHTMLEmail): Promise<void> {
    const fromEmail = this.configService.get<string>('SMTP_USER');

    const msg = {
      to,
      from: `${fromEmail}`,
      subject,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(msg);
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw error;
    }
  }
}
