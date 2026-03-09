import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: { products: { include: { moldProducts: true } } },
    });
  }

  create(data: { name: string; code?: string; contact?: string; phone?: string }) {
    return this.prisma.customer.create({ data });
  }

  update(id: number, data: { name?: string; code?: string; contact?: string; phone?: string }) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.customer.delete({ where: { id } });
  }

  findAllProducts(query?: { customerId?: number; name?: string }) {
    return this.prisma.product.findMany({
      where: {
        ...(query?.customerId ? { customerId: query.customerId } : {}),
        ...(query?.name ? { name: { contains: query.name } } : {}),
      },
      include: { customer: true, _count: { select: { moldProducts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  createProduct(data: { name: string; partNo?: string; model?: string; customerId: number }) {
    return this.prisma.product.create({ data });
  }

  updateProduct(id: number, data: { name?: string; partNo?: string; model?: string; customerId?: number }) {
    return this.prisma.product.update({ where: { id }, data });
  }

  deleteProduct(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
