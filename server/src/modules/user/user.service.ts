import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(query: any) {
    const { page = 1, pageSize = 20, name, username, roleId } = query;
    const where: any = {};
    if (name) where.name = { contains: name };
    if (username) where.username = { contains: username };
    if (roleId) where.roleId = +roleId;
    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip: (+page - 1) * +pageSize, take: +pageSize,
        orderBy: { id: 'asc' },
        select: { id: true, username: true, name: true, phone: true, status: true, roleId: true, createdAt: true, role: { select: { id: true, name: true, code: true, appMode: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { list, total };
  }

  async createUser(data: any) {
    const hash = await bcrypt.hash(data.password || '123456', 10);
    return this.prisma.user.create({
      data: { username: data.username, password: hash, name: data.name, phone: data.phone, roleId: +data.roleId, status: data.status ?? 1 },
    });
  }

  async updateUser(id: number, data: any) {
    const update: any = {};
    if (data.name) update.name = data.name;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.roleId) update.roleId = +data.roleId;
    if (data.status !== undefined) update.status = +data.status;
    if (data.password) update.password = await bcrypt.hash(data.password, 10);
    return this.prisma.user.update({ where: { id }, data: update });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getRoles() {
    return this.prisma.role.findMany({ orderBy: { id: 'asc' } });
  }

  async createRole(data: any) {
    return this.prisma.role.create({ data: { name: data.name, code: data.code, appMode: data.appMode, permissions: data.permissions } });
  }

  async updateRole(id: number, data: any) {
    return this.prisma.role.update({ where: { id }, data });
  }

  async getReport() {
    const moldTotal = await this.prisma.mold.count({ where: { isDeleted: false } });
    const byStatus = await this.prisma.mold.groupBy({ by: ['status'], where: { isDeleted: false }, _count: true });
    const byType = await this.prisma.mold.groupBy({ by: ['type'], where: { isDeleted: false }, _count: true });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthUsage = await this.prisma.usageRecord.count({ where: { createdAt: { gte: monthStart } } });
    const monthRepair = await this.prisma.repairOrder.count({ where: { createdAt: { gte: monthStart } } });
    const monthMaint = await this.prisma.maintenanceRecord.count({ where: { createdAt: { gte: monthStart } } });
    const repairCost = await this.prisma.repairOrder.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { cost: true } });
    const maintCost = await this.prisma.maintenanceRecord.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { cost: true } });
    return { moldTotal, byStatus, byType, monthUsage, monthRepair, monthMaint, repairCost: repairCost._sum.cost || 0, maintCost: maintCost._sum.cost || 0 };
  }
}
