import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get(@TenantId() companyId: string) {
    return this.settingsService.getOrCreate(companyId);
  }

  @Patch()
  update(@TenantId() companyId: string, @Body() body: Record<string, unknown>) {
    return this.settingsService.update(companyId, body);
  }
}
