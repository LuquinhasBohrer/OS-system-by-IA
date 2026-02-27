import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateServiceOrderDto } from './dto';
import { ServiceOrdersService } from './service-orders.service';

@Controller('service-orders')
@UseGuards(JwtAuthGuard)
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(@TenantId() companyId: string, @Body() dto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(companyId, dto);
  }

  @Get()
  list(@TenantId() companyId: string) {
    return this.serviceOrdersService.list(companyId);
  }
}
