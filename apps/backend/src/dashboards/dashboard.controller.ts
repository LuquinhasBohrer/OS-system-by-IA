import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('kpis')
  async getKpis(@TenantId() companyId: string) {
    const openStatuses = ['RECEIVED', 'IN_ANALYSIS', 'WAITING_PART', 'BUDGET_SENT', 'IN_MAINTENANCE', 'READY', 'WAITING_PICKUP'];

    const [openServiceOrders, closedThisMonth, monthlyRevenue, serviceOrders] = await Promise.all([
      this.prisma.serviceOrder.count({ where: { companyId, status: { in: openStatuses as never } } }),
      this.prisma.serviceOrder.count({
        where: {
          companyId,
          status: 'DELIVERED',
          updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      this.prisma.budget.aggregate({
        _sum: { total: true },
        where: {
          serviceOrder: { companyId },
          status: 'APPROVED',
          approvedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      this.prisma.serviceOrder.findMany({
        where: { companyId },
        include: { budget: true },
      }),
    ]);

    const approvedBudgets = serviceOrders.filter((so) => so.budget?.status === 'APPROVED').length;
    const totalRevenue = Number(monthlyRevenue._sum.total || 0);

    return {
      openServiceOrders,
      closedThisMonth,
      monthlyRevenue: totalRevenue,
      avgTicket: approvedBudgets ? totalRevenue / approvedBudgets : 0,
    };
  }
}
