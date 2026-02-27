import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterCompanyDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerCompany(dto: RegisterCompanyDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
    if (existing) {
      throw new BadRequestException('Já existe usuário com este e-mail');
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: dto.companyName,
          plan: 'FREE',
          monthlyOsLimit: 50,
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.adminName,
          email: dto.adminEmail,
          passwordHash,
          role: 'ADMIN',
          companyId: company.id,
        },
      });

      return { company, user };
    });

    return {
      companyId: created.company.id,
      companyName: created.company.name,
      userId: created.user.id,
      email: created.user.email,
    };
  }

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'ATTENDANT',
        companyId: dto.companyId,
      },
    });

    return { id: user.id, email: user.email };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      companyId: user.companyId,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }
}
