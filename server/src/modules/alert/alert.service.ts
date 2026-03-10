import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AlertService {
  constructor(private prisma: PrismaService) {}

  async getAlerts(query: any) {
    const { page = 1, pageSize = 20, type, status, moldNo } = query;
    const where: Prisma.AlertWhereInput = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (moldNo) where.mold = { moldNo: { contains: moldNo } };
    const [list, total] = await Promise.all([
      this.prisma.alert.findMany({
        where, skip: (+page - 1) * +pageSize, take: +pageSize,
        orderBy: { createdAt: 'desc' },
        include: { mold: { select: { moldNo: true, type: true } } },
      }),
      this.prisma.alert.count({ where }),
    ]);
    return { list, total };
  }

  async handleAlert(id: number, handlerId: number) {
    return this.prisma.alert.update({ where: { id }, data: { status: '已处理', handlerId, handledAt: new Date() } });
  }

  async getRules() {
    return this.prisma.alertRule.findMany();
  }

  async updateRule(id: number, data: any) {
    const update: any = {};
    if (data.threshold !== undefined) update.threshold = data.threshold;
    if (data.enabled !== undefined) update.enabled = data.enabled;
    return this.prisma.alertRule.update({ where: { id }, data: update });
  }
}
