import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecordService {
  constructor(private prisma: PrismaService) {}

  async getUsageRecords(query: any) {
    const { page = 1, pageSize = 20, moldId, moldNo, startDate, endDate } = query;
    const where: Prisma.UsageRecordWhereInput = {};
    if (moldId) where.moldId = +moldId;
    if (moldNo) where.mold = { moldNo: { contains: moldNo } };
    if (startDate || endDate) {
      where.useDate = {};
      if (startDate) where.useDate.gte = new Date(startDate);
      if (endDate) where.useDate.lte = new Date(endDate);
    }
    const [list, total] = await Promise.all([
      this.prisma.usageRecord.findMany({
        where, skip: (+page - 1) * +pageSize, take: +pageSize,
        orderBy: { createdAt: 'desc' },
        include: { mold: { select: { moldNo: true, type: true } }, product: { select: { name: true } }, user: { select: { name: true } } },
      }),
      this.prisma.usageRecord.count({ where }),
    ]);
    return { list, total };
  }

  async getBorrowRecords(query: any) {
    const { page = 1, pageSize = 20, moldId, moldNo, type, startDate, endDate } = query;
    const where: Prisma.BorrowRecordWhereInput = {};
    if (moldId) where.moldId = +moldId;
    if (moldNo) where.mold = { moldNo: { contains: moldNo } };
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    const [list, total] = await Promise.all([
      this.prisma.borrowRecord.findMany({
        where, skip: (+page - 1) * +pageSize, take: +pageSize,
        orderBy: { createdAt: 'desc' },
        include: { mold: { select: { moldNo: true, type: true, status: true } }, user: { select: { name: true } } },
      }),
      this.prisma.borrowRecord.count({ where }),
    ]);
    return { list, total };
  }

  async getBorrowDistribution() {
    const molds = await this.prisma.mold.findMany({
      where: { status: '在用', isDeleted: false },
      select: { id: true, moldNo: true, type: true, location: true, moldProducts: { include: { product: { include: { customer: true } } } } },
    });
    const byLocation: Record<string, number> = {};
    const byCustomer: Record<string, number> = {};
    molds.forEach((m) => {
      byLocation[m.location || '未知'] = (byLocation[m.location || '未知'] || 0) + 1;
      const cname = m.moldProducts?.[0]?.product?.customer?.name || '未知';
      byCustomer[cname] = (byCustomer[cname] || 0) + 1;
    });
    return { total: molds.length, molds, byLocation, byCustomer };
  }

  async getMaintenanceRecords(query: any) {
    const { page = 1, pageSize = 20, moldId, moldNo, startDate, endDate } = query;
    const where: Prisma.MaintenanceRecordWhereInput = {};
    if (moldId) where.moldId = +moldId;
    if (moldNo) where.mold = { moldNo: { contains: moldNo } };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    const [list, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where, skip: (+page - 1) * +pageSize, take: +pageSize,
        orderBy: { date: 'desc' },
        include: { mold: { select: { moldNo: true, type: true } }, user: { select: { name: true } } },
      }),
      this.prisma.maintenanceRecord.count({ where }),
    ]);
    return { list, total };
  }

  async createMaintenance(userId: number, data: any) {
    const record = await this.prisma.maintenanceRecord.create({
      data: { moldId: +data.moldId, date: new Date(data.date || new Date()), content: data.content, userId, cost: data.cost ? +data.cost : null, remark: data.remark },
    });
    if (data.nextDate) {
      await this.prisma.mold.update({ where: { id: +data.moldId }, data: { nextMaintenanceDate: new Date(data.nextDate) } });
    }
    return record;
  }

  async getMaintenancePlan() {
    const molds = await this.prisma.mold.findMany({
      where: { isDeleted: false, maintenanceCycle: { not: null } },
      select: { id: true, moldNo: true, type: true, status: true, maintenanceCycle: true, nextMaintenanceDate: true, location: true },
      orderBy: { nextMaintenanceDate: 'asc' },
    });
    return molds;
  }

  async getRepairOrders(query: any) {
    const { page = 1, pageSize = 20, moldNo, status, startDate, endDate } = query;
    const where: Prisma.RepairOrderWhereInput = {};
    if (moldNo) where.mold = { moldNo: { contains: moldNo } };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    const [list, total] = await Promise.all([
      this.prisma.repairOrder.findMany({
        where, skip: (+page - 1) * +pageSize, take: +pageSize,
        orderBy: { createdAt: 'desc' },
        include: { mold: { select: { moldNo: true, type: true } }, reporter: { select: { name: true } }, handler: { select: { name: true } } },
      }),
      this.prisma.repairOrder.count({ where }),
    ]);
    return { list, total };
  }

  async updateRepairOrder(id: number, data: any) {
    const update: any = {};
    if (data.status) update.status = data.status;
    if (data.handlerId) update.handlerId = +data.handlerId;
    if (data.handleDesc) update.handleDesc = data.handleDesc;
    if (data.cost !== undefined) update.cost = +data.cost;
    if (data.status === '已完成') {
      update.completedAt = new Date();
      const order = await this.prisma.repairOrder.findUnique({ where: { id } });
      if (order) await this.prisma.mold.update({ where: { id: order.moldId }, data: { status: '在库' } });
    }
    return this.prisma.repairOrder.update({ where: { id }, data: update });
  }

  async getRepairStats() {
    const total = await this.prisma.repairOrder.count();
    const byStatus = await this.prisma.repairOrder.groupBy({ by: ['status'], _count: true });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthCount = await this.prisma.repairOrder.count({ where: { createdAt: { gte: monthStart } } });
    const monthCost = await this.prisma.repairOrder.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { cost: true } });
    return { total, byStatus, monthCount, monthCost: monthCost._sum.cost || 0 };
  }

  async getInspections(query: any) {
    const { page = 1, pageSize = 20, moldNo, result, startDate, endDate } = query;
    const where: Prisma.InspectionWhereInput = {};
    if (moldNo) where.mold = { moldNo: { contains: moldNo } };
    if (result) where.result = result;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    const [list, total] = await Promise.all([
      this.prisma.inspection.findMany({
        where, skip: (+page - 1) * +pageSize, take: +pageSize,
        orderBy: { date: 'desc' },
        include: { mold: { select: { moldNo: true, type: true, designLife: true, lifeUnit: true } }, user: { select: { name: true } } },
      }),
      this.prisma.inspection.count({ where }),
    ]);
    return { list, total };
  }

  async createInspection(userId: number, data: any) {
    const record = await this.prisma.inspection.create({
      data: {
        moldId: +data.moldId, date: new Date(data.date || new Date()), result: data.result,
        newCycleValue: data.newCycleValue ? +data.newCycleValue : null,
        nextDate: data.nextDate ? new Date(data.nextDate) : null,
        inspector: data.inspector, userId, remark: data.remark,
      },
    });
    if (data.result === '调整周期' && data.newCycleValue) {
      await this.prisma.mold.update({ where: { id: +data.moldId }, data: { designLife: +data.newCycleValue } });
    }
    if (data.nextDate) {
      await this.prisma.mold.update({ where: { id: +data.moldId }, data: { nextInspectionDate: new Date(data.nextDate) } });
    }
    return record;
  }
}
