import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BudgetStatus, Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { CreateBudgetDto } from './dto';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockService: StockService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private generateApprovalToken(payload: string) {
    const token = randomBytes(24).toString('hex');
    const hash = createHash('sha256').update(payload).digest('hex');

    return { token, integrityHash: hash };
  }

  async create(companyId: string, actorId: string, dto: CreateBudgetDto) {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: dto.serviceOrderId, companyId },
      include: { client: true },
    });

    if (!serviceOrder) throw new NotFoundException('OS não encontrada');
    if (!dto.items.length) throw new BadRequestException('Orçamento sem itens');

    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountPercent = dto.discountPercent ?? 0;
    const discountFixed = dto.discountFixed ?? 0;
    const discountByPercent = subtotal * (discountPercent / 100);
    const total = Math.max(0, subtotal - discountByPercent - discountFixed);

    const payload = JSON.stringify({ companyId, serviceOrderId: dto.serviceOrderId, subtotal, total, items: dto.items });
    const { token, integrityHash } = this.generateApprovalToken(payload);
    const expiresAt = new Date(Date.now() + (dto.expiryDays ?? 5) * 24 * 60 * 60 * 1000);

    const budget = await this.prisma.budget.upsert({
      where: { serviceOrderId: dto.serviceOrderId },
      update: {
        status: BudgetStatus.SENT,
        subtotal: new Prisma.Decimal(subtotal),
        discountPercent: new Prisma.Decimal(discountPercent),
        discountFixed: new Prisma.Decimal(discountFixed),
        laborPrice: new Prisma.Decimal(0),
        total: new Prisma.Decimal(total),
        technicalNotes: dto.technicalNotes,
        integrityHash,
        expiresAt,
        token: {
          upsert: {
            update: { token, expiresAt, viewedAt: null, acceptedAt: null, ipAddress: null },
            create: { token, expiresAt },
          },
        },
        items: {
          deleteMany: {},
          create: dto.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalPrice: new Prisma.Decimal(item.unitPrice * item.quantity),
          })),
        },
      },
      create: {
        serviceOrderId: dto.serviceOrderId,
        status: BudgetStatus.SENT,
        subtotal: new Prisma.Decimal(subtotal),
        discountPercent: new Prisma.Decimal(discountPercent),
        discountFixed: new Prisma.Decimal(discountFixed),
        laborPrice: new Prisma.Decimal(0),
        total: new Prisma.Decimal(total),
        technicalNotes: dto.technicalNotes,
        integrityHash,
        expiresAt,
        token: { create: { token, expiresAt } },
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalPrice: new Prisma.Decimal(item.unitPrice * item.quantity),
          })),
        },
      },
      include: { token: true, items: true },
    });

    await this.prisma.serviceOrder.update({
      where: { id: dto.serviceOrderId },
      data: {
        status: 'BUDGET_SENT',
        statusHistory: { create: { status: 'BUDGET_SENT', changedById: actorId } },
      },
    });

    this.notificationsService.notify('WHATSAPP', serviceOrder.client.phone, `Orçamento enviado. Link: /orcamento/${token}`);

    return budget;
  }

  async findPublic(token: string, ipAddress: string) {
    const budgetToken = await this.prisma.budgetToken.findUnique({
      where: { token },
      include: {
        budget: {
          include: {
            items: true,
            serviceOrder: { include: { client: true, company: true, equipments: true } },
          },
        },
      },
    });

    if (!budgetToken) throw new NotFoundException('Token inválido');
    if (budgetToken.expiresAt < new Date()) throw new BadRequestException('Orçamento expirado');

    await this.prisma.budgetToken.update({ where: { id: budgetToken.id }, data: { viewedAt: new Date(), ipAddress } });

    return budgetToken.budget;
  }

  async approve(token: string, ipAddress: string) {
    const budgetToken = await this.prisma.budgetToken.findUnique({
      where: { token },
      include: { budget: { include: { items: true, serviceOrder: true } } },
    });

    if (!budgetToken) throw new NotFoundException('Token inválido');
    if (budgetToken.expiresAt < new Date()) throw new BadRequestException('Orçamento expirado');

    await this.prisma.$transaction(async (tx) => {
      await tx.budget.update({
        where: { id: budgetToken.budgetId },
        data: { status: 'APPROVED', approvedAt: new Date() },
      });

      await tx.budgetToken.update({
        where: { id: budgetToken.id },
        data: { acceptedAt: new Date(), ipAddress },
      });

      await tx.serviceOrder.update({
        where: { id: budgetToken.budget.serviceOrderId },
        data: {
          status: 'IN_MAINTENANCE',
          statusHistory: { create: { status: 'IN_MAINTENANCE', changedById: budgetToken.budget.serviceOrder.technicianId } },
        },
      });
    });

    for (const item of budgetToken.budget.items.filter((it) => it.productId)) {
      await this.stockService.decrementProduct(budgetToken.budget.serviceOrder.companyId, item.productId!, item.quantity);
    }

    return { status: 'APPROVED' };
  }

  async reject(token: string, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('Justificativa obrigatória');

    const budgetToken = await this.prisma.budgetToken.findUnique({
      where: { token },
      include: { budget: { include: { serviceOrder: true } } },
    });

    if (!budgetToken) throw new NotFoundException('Token inválido');

    await this.prisma.$transaction(async (tx) => {
      await tx.budget.update({
        where: { id: budgetToken.budgetId },
        data: { status: 'REJECTED', rejectedReason: reason },
      });

      await tx.serviceOrder.update({
        where: { id: budgetToken.budget.serviceOrderId },
        data: {
          status: 'WAITING_PICKUP',
          statusHistory: { create: { status: 'WAITING_PICKUP', changedById: budgetToken.budget.serviceOrder.technicianId } },
        },
      });
    });

    return { status: 'REJECTED' };
  }
}
