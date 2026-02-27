import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listByCompany(companyId: string) {
    return this.prisma.user.findMany({ where: { companyId } });
  }
}
