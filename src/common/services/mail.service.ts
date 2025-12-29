/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { SendHTMLEmail } from '../types';
@Injectable()
export class MailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  async sendHTMLEmail({ to, subject, htmlContent }: SendHTMLEmail): Promise<void> {
    console.log(process.env.MAIL_FROM, 'aaaa');

    const msg = {
      to,
      from: {
        email: process.env.MAIL_FROM as string, // đã verify trong SendGrid
        name: 'Book Store',
      },
      subject,
      html: htmlContent,
    };

    try {
      await sgMail.send(msg);
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
