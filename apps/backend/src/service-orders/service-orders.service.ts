import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PdfService } from '../pdf/pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateServiceOrderDto } from './dto';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientsService: ClientsService,
    private readonly settingsService: SettingsService,
    private readonly pdfService: PdfService,
    private readonly notificationsService: NotificationsService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(companyId: string, dto: CreateServiceOrderDto) {
    let clientId = dto.clientId;

    if (!clientId && dto.newClient) {
      const client = await this.clientsService.upsertClient(companyId, dto.newClient);
      clientId = client.id;
    }

    if (!clientId) {
      throw new BadRequestException('Cliente é obrigatório');
    }

    const lastOrder = await this.prisma.serviceOrder.findFirst({
      where: { companyId },
      orderBy: { sequence: 'desc' },
    });

    const nextSequence = (lastOrder?.sequence ?? 0) + 1;

    const order = await this.prisma.serviceOrder.create({
      data: {
        companyId,
        clientId,
        technicianId: dto.technicianId,
        sequence: nextSequence,
        status: 'RECEIVED',
        equipments: {
          createMany: {
            data: dto.equipments,
          },
        },
        statusHistory: {
          create: {
            status: 'RECEIVED',
            changedById: dto.technicianId,
          },
        },
      },
      include: { equipments: true, client: true, company: true },
    });

    const settings = await this.settingsService.getOrCreate(companyId);
    const orderNumber = `#${String(order.sequence).padStart(4, '0')}`;
    const trackingLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/acompanhar/${order.sequence}?chave=${order.id}`;

    const pdf = await this.pdfService.renderServiceOrderPdf({
      companyName: order.company.name,
      logoUrl: settings.logoUrl,
      orderNumber,
      customerName: order.client.name,
      equipmentSummary: order.equipments.map((eq) => `${eq.equipmentType} ${eq.brand} ${eq.model}`).join(', '),
      serviceTerms: settings.serviceTerms,
      trackingLink,
    });

    const emailTemplate = settings.serviceOrderEmailTemplate ||
      'Olá {{nome}}, sua ordem de serviço #{{numero}} foi criada. Acompanhe em {{link}}.';
    const whatsappTemplate = settings.serviceOrderWhatsappTemplate ||
      'OS #{{numero}} criada. Acompanhe em {{link}}.';

    const emailMessage = emailTemplate
      .replaceAll('{{nome}}', order.client.name)
      .replaceAll('{{numero}}', orderNumber)
      .replaceAll('{{link}}', trackingLink);
    const whatsappMessage = whatsappTemplate
      .replaceAll('{{nome}}', order.client.name)
      .replaceAll('{{numero}}', orderNumber)
      .replaceAll('{{link}}', trackingLink);

    if (order.client.email) {
      await this.notificationsService.sendEmail({
        companyId,
        to: order.client.email,
        from: settings.emailFromAddress || undefined,
        subject: `Ordem de Serviço ${orderNumber} criada`,
        html: `<p>${emailMessage}</p><p><a href="${trackingLink}">Acompanhar OS</a></p>`,
        attachments: [{ filename: pdf.filename, content: Buffer.from(pdf.buffer) }],
      });
    }

    await this.whatsappService.sendServiceOrderMessage(companyId, order.client.whatsapp || order.client.phone, `${whatsappMessage}\nPDF: ${pdf.url}`);

    return { ...order, trackingLink, pdfUrl: pdf.url };
  }

  list(companyId: string) {
    return this.prisma.serviceOrder.findMany({
      where: { companyId },
      include: { client: true, budget: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
