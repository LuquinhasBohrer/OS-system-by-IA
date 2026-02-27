import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, PublicBudgetActionDto } from './dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@TenantId() companyId: string, @Req() req: Request, @Body() dto: CreateBudgetDto) {
    const actorId = (req as Request & { user: { userId: string } }).user.userId;
    return this.budgetsService.create(companyId, actorId, dto);
  }

  @Get('public/:token')
  findPublic(@Param('token') token: string, @Headers('x-forwarded-for') ip?: string) {
    return this.budgetsService.findPublic(token, ip?.split(',')[0]?.trim() || '0.0.0.0');
  }

  @Post('public/:token/approve')
  approve(@Param('token') token: string, @Headers('x-forwarded-for') ip?: string) {
    return this.budgetsService.approve(token, ip?.split(',')[0]?.trim() || '0.0.0.0');
  }

  @Post('public/:token/reject')
  reject(@Param('token') token: string, @Body() body: PublicBudgetActionDto) {
    const parsed = z.object({ reason: z.string().min(5, 'Justificativa obrigatória') }).parse({
      reason: body.reason,
    });

    return this.budgetsService.reject(token, parsed.reason);
  }
}
