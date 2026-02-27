import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  list(@TenantId() companyId: string) {
    return this.clientsService.search(companyId, '');
  }

  @Get('search')
  search(@TenantId() companyId: string, @Query('q') query: string) {
    return this.clientsService.search(companyId, query || '');
  }

  @Post()
  create(
    @TenantId() companyId: string,
    @Body() body: { name: string; phone: string; email?: string; cpfCnpj?: string },
  ) {
    return this.clientsService.upsertClient(companyId, body);
  }
}
