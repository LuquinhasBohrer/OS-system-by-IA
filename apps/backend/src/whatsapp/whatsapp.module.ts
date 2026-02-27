import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [NotificationsModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
