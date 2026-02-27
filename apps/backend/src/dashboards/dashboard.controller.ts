import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  @Get('kpis')
  getKpis() {
    return {
      openServiceOrders: 0,
      closedThisMonth: 0,
      monthlyRevenue: 0,
      avgTicket: 0,
    };
  }
}
