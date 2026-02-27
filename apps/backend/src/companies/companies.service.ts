import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.company.create({ data: { name, plan: 'FREE' } });
  }
}
