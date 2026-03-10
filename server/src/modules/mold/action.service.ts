import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActionService {
  constructor(private prisma: PrismaService) {}

  async recordUsage(userId: number, data: { moldId: number; amount: number; productId?: number; remark?: string }) {
    if (!data.moldId || !data.amount) throw new BadRequestException('moldId和amount必填');
    const record = await this.prisma.usageRecord.create({
      data: {
        moldId: data.moldId,
        amount: data.amount,
        productId: data.productId,
        useDate: new Date(),
        userId,
        remark: data.remark,
      },
    });
    await this.prisma.mold.update({
      where: { id: data.moldId },
      data: { totalUsage: { increment: data.amount } },
    });
    return record;
  }

  async borrow(userId: number, data: { moldId: number; workshop?: string; machine?: string }) {
    if (!data.moldId) throw new BadRequestException('moldId必填');
    const record = await this.prisma.borrowRecord.create({
      data: { moldId: data.moldId, type: '领用', userId, workshop: data.workshop, machine: data.machine },
    });
    await this.prisma.mold.update({
      where: { id: data.moldId },
      data: { status: '在用', location: data.workshop || undefined },
    });
    return record;
  }

  async returnMold(userId: number, data: { moldId: number }) {
    if (!data.moldId) throw new BadRequestException('moldId必填');
    const record = await this.prisma.borrowRecord.create({
      data: { moldId: data.moldId, type: '归还', userId },
    });
    await this.prisma.mold.update({
      where: { id: data.moldId },
      data: { status: '在库', location: '仓库' },
    });
    return record;
  }

  async reportRepair(userId: number, data: { moldId: number; description: string }) {
    if (!data.moldId || !data.description) throw new BadRequestException('moldId和description必填');
    const order = await this.prisma.repairOrder.create({
      data: { moldId: data.moldId, description: data.description, reporterId: userId },
    });
    await this.prisma.mold.update({
      where: { id: data.moldId },
      data: { status: '维修中' },
    });
    return order;
  }
}
