import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DictService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.dictType.findMany({ include: { items: { orderBy: { sort: 'asc' } } } });
  }

  findByCode(code: string) {
    return this.prisma.dictType.findUnique({
      where: { code },
      include: { items: { where: { status: 1 }, orderBy: { sort: 'asc' } } },
    });
  }
}
