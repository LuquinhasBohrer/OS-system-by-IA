import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  defaultBudgetValidityDays = 5;
  defaultWarrantyDays = 90;
}
