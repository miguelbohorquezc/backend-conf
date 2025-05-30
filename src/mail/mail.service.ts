// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  async sendPasswordReset(email: string, token: string) {
    const link = `http://localhost:3000/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: '"Tu App" <tucorreo@gmail.com>',
      to: email,
      subject: 'Recuperación de contraseña',
      html: `<p>Haz clic <a href="${link}">aquí</a> para restablecer tu contraseña.</p>`,
    });
  }
}
