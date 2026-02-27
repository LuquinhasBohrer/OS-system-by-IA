import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private transporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }

  async sendEmail(params: {
    companyId: string;
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
    from?: string;
  }) {
    const from = params.from || process.env.EMAIL_FROM || 'noreply@os-saas.local';

    if (process.env.SMTP_HOST) {
      await this.transporter().sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments,
      });
    } else {
      this.logger.log(`[EMAIL-MOCK] ${params.to} - ${params.subject}`);
    }

    await this.prisma.notification.create({
      data: {
        companyId: params.companyId,
        channel: 'EMAIL',
        recipient: params.to,
        subject: params.subject,
        body: params.html,
        status: 'SENT',
      },
    });
  }

  async logWhatsapp(companyId: string, to: string, body: string) {
    await this.prisma.notification.create({
      data: {
        companyId,
        channel: 'WHATSAPP',
        recipient: to,
        body,
        status: 'SENT',
      },
    });
  }
}
