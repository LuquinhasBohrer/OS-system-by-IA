import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async decrementProduct(companyId: string, productId: string, quantity: number) {
    const result = await this.prisma.product.updateMany({
      where: { id: productId, companyId },
      data: { quantity: { decrement: quantity } },
    });

    if (!result.count) {
      throw new NotFoundException('Produto não encontrado para a empresa');
    }
  }
}
