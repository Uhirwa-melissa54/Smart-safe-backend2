import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from = this.config.get<string>('SMTP_FROM') ?? user ?? 'no-reply@example.com';

    if (!host || !user || !pass) {
      // We still construct the service but will throw if used without config.
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendPasswordResetOtp(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Your SmartSafe password reset code',
        text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      });
    } catch {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}

