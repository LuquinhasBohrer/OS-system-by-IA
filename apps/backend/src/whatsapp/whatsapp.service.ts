import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  async sendServiceOrderMessage(companyId: string, phone: string, message: string) {
    const provider = process.env.WHATSAPP_PROVIDER || 'z-api';

    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
      try {
        await fetch(process.env.WHATSAPP_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          },
          body: JSON.stringify({ phone, message }),
        });
      } catch (error) {
        this.logger.warn(`Falha no envio real de WhatsApp, seguindo com log local: ${String(error)}`);
      }
    } else {
      this.logger.log(`[WHATSAPP-MOCK][${provider}] ${phone}: ${message}`);
    }

    await this.notificationsService.logWhatsapp(companyId, phone, message);

    return { provider, status: 'SENT' };
  }
}
