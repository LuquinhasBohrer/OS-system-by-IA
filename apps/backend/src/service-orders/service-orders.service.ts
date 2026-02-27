import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOrderDto } from './dto';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientsService: ClientsService,
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

    return this.prisma.serviceOrder.create({
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
      include: { equipments: true, client: true },
    });
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
