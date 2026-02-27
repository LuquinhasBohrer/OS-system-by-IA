import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  notify(channel: 'EMAIL' | 'WHATSAPP', destination: string, message: string) {
    this.logger.log(`[${channel}] ${destination}: ${message}`);
  }
}
