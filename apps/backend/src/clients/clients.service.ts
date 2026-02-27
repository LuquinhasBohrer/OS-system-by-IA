import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  upsertClient(companyId: string, data: { name: string; cpfCnpj?: string; phone: string; email?: string }) {
    return this.prisma.client.create({
      data: {
        companyId,
        name: data.name,
        cpfCnpj: data.cpfCnpj,
        phone: data.phone,
        email: data.email,
      },
    });
  }

  search(companyId: string, q: string) {
    return this.prisma.client.findMany({
      where: {
        companyId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { cpfCnpj: { contains: q } },
          { phone: { contains: q } },
        ],
      },
    });
  }
}
