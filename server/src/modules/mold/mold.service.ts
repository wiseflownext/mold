import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MoldService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    pageSize?: number;
    moldNo?: string;
    type?: string;
    status?: string;
    location?: string;
    customerId?: number;
    productName?: string;
    partNo?: string;
    lifeRateMin?: number;
    lifeRateMax?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const where: Prisma.MoldWhereInput = { isDeleted: false };

    if (query.moldNo) where.moldNo = { contains: query.moldNo };
    if (query.type) where.type = query.type;
    if (query.status) where.status = { in: query.status.split(',') };
    if (query.location) where.location = query.location;
    if (query.productName || query.partNo || query.customerId) {
      where.moldProducts = {
        some: {
          product: {
            ...(query.productName ? { name: { contains: query.productName } } : {}),
            ...(query.partNo ? { partNo: { contains: query.partNo } } : {}),
            ...(query.customerId ? { customerId: query.customerId } : {}),
          },
        },
      };
    }

    const orderBy: Prisma.MoldOrderByWithRelationInput = {};
    if (query.sortBy) {
      (orderBy as Record<string, string>)[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    const [list, total] = await Promise.all([
      this.prisma.mold.findMany({
        where,
        include: {
          moldProducts: { include: { product: { include: { customer: true } } } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.mold.count({ where }),
    ]);

    const data = list.map((m) => {
      const designLife = m.designLife ? Number(m.designLife) : null;
      const totalUsage = Number(m.totalUsage);
      const lifeRate = designLife ? Math.round((totalUsage / designLife) * 10000) / 100 : null;
      return { ...m, totalUsage, designLife, lifeRate };
    });

    if (query.lifeRateMin !== undefined || query.lifeRateMax !== undefined) {
      const min = query.lifeRateMin ?? 0;
      const max = query.lifeRateMax ?? 999;
      const filtered = data.filter((m) => m.lifeRate !== null && m.lifeRate >= min && m.lifeRate <= max);
      return { list: filtered, total: filtered.length, page, pageSize };
    }

    return { list: data, total, page, pageSize };
  }

  async findOne(id: number) {
    const mold = await this.prisma.mold.findUnique({
      where: { id },
      include: {
        moldProducts: { include: { product: { include: { customer: true } } } },
        acceptance: { include: { reportFile: true } },
        usageRecords: { orderBy: { useDate: 'desc' }, take: 50, include: { product: true, user: true } },
        borrowRecords: { orderBy: { createdAt: 'desc' }, take: 50, include: { user: true } },
        maintenanceRecords: { orderBy: { date: 'desc' }, take: 50, include: { user: true } },
        repairOrders: { orderBy: { createdAt: 'desc' }, take: 50, include: { reporter: true, handler: true } },
        inspections: { orderBy: { date: 'desc' }, take: 50, include: { user: true, reportFile: true } },
        photos: { orderBy: { createdAt: 'desc' }, take: 50, include: { file: true, user: true } },
        statusChanges: { orderBy: { createdAt: 'desc' }, take: 50, include: { user: true } },
      },
    });
    if (!mold) return null;
    const designLife = mold.designLife ? Number(mold.designLife) : null;
    const totalUsage = Number(mold.totalUsage);
    const lifeRate = designLife ? Math.round((totalUsage / designLife) * 10000) / 100 : null;
    return { ...mold, totalUsage, designLife, lifeRate };
  }

  async create(data: {
    moldNo: string;
    type: string;
    designLife?: number;
    lifeUnit?: string;
    maintenanceCycle?: number;
    inspectionCycle?: number;
    firstUseDate?: Date;
    productIds?: number[];
  }) {
    const mold = await this.prisma.mold.create({
      data: {
        moldNo: data.moldNo,
        type: data.type,
        designLife: data.designLife,
        lifeUnit: data.lifeUnit || '米',
        maintenanceCycle: data.maintenanceCycle,
        inspectionCycle: data.inspectionCycle,
        firstUseDate: data.firstUseDate,
        moldProducts: data.productIds?.length
          ? { create: data.productIds.map((pid) => ({ productId: pid })) }
          : undefined,
      },
    });
    return mold;
  }

  async update(id: number, data: Partial<{
    type: string;
    location: string;
    designLife: number;
    lifeUnit: string;
    totalUsage: number;
    maintenanceCycle: number;
    inspectionCycle: number;
    firstUseDate: Date;
    status: string;
  }>) {
    return this.prisma.mold.update({ where: { id }, data });
  }

  async softDelete(id: number) {
    const mold = await this.prisma.mold.findUnique({ where: { id } });
    if (!mold) return null;
    if (!['在库', '报废'].includes(mold.status)) {
      throw new Error('仅在库和报废状态的模具可删除');
    }
    return this.prisma.mold.update({ where: { id }, data: { isDeleted: true } });
  }

  async getStats() {
    const total = await this.prisma.mold.count({ where: { isDeleted: false } });
    const inUse = await this.prisma.mold.count({ where: { isDeleted: false, status: '在用' } });
    const inStock = await this.prisma.mold.count({ where: { isDeleted: false, status: '在库' } });
    const repairing = await this.prisma.mold.count({ where: { isDeleted: false, status: '维修中' } });
    const maintaining = await this.prisma.mold.count({ where: { isDeleted: false, status: '保养中' } });

    const repairCount = await this.prisma.repairOrder.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    });
    const maintenanceDone = await this.prisma.maintenanceRecord.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    });
    const alertCount = await this.prisma.alert.count({ where: { status: '未处理' } });

    const allMolds = await this.prisma.mold.findMany({
      where: { isDeleted: false, designLife: { not: null } },
      select: { designLife: true, totalUsage: true },
    });
    const lifeDistribution = { low: 0, mid: 0, high: 0, critical: 0, over: 0 };
    allMolds.forEach((m) => {
      const rate = Number(m.totalUsage) / Number(m.designLife!) * 100;
      if (rate > 100) lifeDistribution.over++;
      else if (rate >= 90) lifeDistribution.critical++;
      else if (rate >= 80) lifeDistribution.high++;
      else if (rate >= 50) lifeDistribution.mid++;
      else lifeDistribution.low++;
    });

    const customerDist = await this.prisma.customer.findMany({
      include: { products: { include: { moldProducts: true } } },
    });
    const customerMoldCount = customerDist.map((c) => ({
      name: c.name,
      count: new Set(c.products.flatMap((p) => p.moldProducts.map((mp) => mp.moldId))).size,
    })).filter((c) => c.count > 0);

    return {
      total, inUse, inStock, repairing, maintaining,
      useRate: total ? Math.round((inUse / total) * 100) : 0,
      repairCount, maintenanceDone, alertCount,
      lifeDistribution, customerMoldCount,
    };
  }
}
