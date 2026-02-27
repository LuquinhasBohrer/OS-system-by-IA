import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaults = {
    serviceTerms: 'Equipamento recebido para análise técnica.',
    warrantyTerms: 'Garantia de 90 dias para serviços executados.',
    defaultWarrantyDays: 90,
    whatsappTemplates: { serviceOrderCreated: 'Olá {{nome}}, sua OS #{{numero}} foi criada. Link: {{link}}' },
    emailTemplates: {
      serviceOrderCreated: 'Olá {{nome}}, sua OS #{{numero}} foi criada com sucesso. Link de acompanhamento: {{link}}',
    },
    budgetValidityDays: 5,
    equipmentTypes: ['Celular', 'Notebook'],
    equipmentBrands: ['Samsung', 'Apple'],
    alertRules: { noBudgetAfterDays: 7 },
    serviceOrderEmailTemplate:
      'Olá {{nome}}, sua ordem de serviço #{{numero}} foi criada com sucesso. Acompanhe em: {{link}}',
    serviceOrderWhatsappTemplate:
      'OS #{{numero}} criada com sucesso. Acompanhe aqui: {{link}}',
  };

  getOrCreate(companyId: string) {
    return this.prisma.setting.upsert({
      where: { companyId },
      update: {},
      create: {
        companyId,
        ...this.defaults,
      },
    });
  }

  update(companyId: string, data: Partial<Record<string, unknown>>) {
    return this.prisma.setting.upsert({
      where: { companyId },
      update: data,
      create: {
        companyId,
        ...this.defaults,
        ...data,
      },
    });
  }
}
