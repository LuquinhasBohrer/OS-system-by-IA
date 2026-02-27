import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  async sendTemplate(phone: string, template: string, data: Record<string, string>) {
    return {
      provider: process.env.WHATSAPP_PROVIDER || 'z-api',
      phone,
      template,
      data,
      status: 'QUEUED',
    };
  }
}
