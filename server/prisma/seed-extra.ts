import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const molds = await prisma.mold.findMany({ where: { isDeleted: false }, take: 20 });
  if (!molds.length) { console.log('No molds found, skip'); return; }

  const users = await prisma.user.findMany();
  const adminId = users.find(u => u.username === 'admin')?.id || 1;
  const workerId = users.find(u => u.username === 'worker1')?.id || 2;

  // manager role user
  const managerRole = await prisma.role.findUnique({ where: { code: 'manager' } });
  if (managerRole) {
    const exists = await prisma.user.findUnique({ where: { username: 'manager1' } });
    if (!exists) {
      const bcrypt = require('bcrypt');
      const pwd = await bcrypt.hash('123456', 10);
      await prisma.user.create({ data: { username: 'manager1', password: pwd, name: '李经理', roleId: managerRole.id, status: 1 } });
    }
  }

  const now = new Date();
  const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000);

  for (let i = 0; i < Math.min(molds.length, 10); i++) {
    const m = molds[i];

    // usage records
    for (let j = 0; j < 3; j++) {
      await prisma.usageRecord.create({
        data: { moldId: m.id, amount: Math.floor(Math.random() * 5000) + 500, useDate: d(j * 7 + i), userId: workerId },
      });
    }

    // borrow records
    await prisma.borrowRecord.create({
      data: { moldId: m.id, type: '领用', userId: workerId, workshop: ['挤出车间', '模压车间', '接角车间'][i % 3], machine: `${i + 1}号机` },
    });
    if (i % 3 === 0) {
      await prisma.borrowRecord.create({
        data: { moldId: m.id, type: '归还', userId: workerId },
      });
    }

    // maintenance records
    if (i < 5) {
      await prisma.maintenanceRecord.create({
        data: { moldId: m.id, date: d(i * 10 + 5), content: ['清洁模面', '更换易损件', '润滑导柱', '检查冷却水路', '紧固螺栓'][i], userId: workerId, remark: '常规保养' },
      });
    }
  }

  // repair orders
  const statuses = ['待处理', '处理中', '已完成'];
  for (let i = 0; i < Math.min(molds.length, 6); i++) {
    await prisma.repairOrder.create({
      data: {
        moldId: molds[i].id,
        description: ['模面裂纹', '导柱磨损', '顶针断裂', '冷却不良', '合模不紧', '表面拉毛'][i],
        status: statuses[i % 3],
        reporterId: workerId,
        handlerId: i % 3 === 2 ? adminId : null,
        handleDesc: i % 3 === 2 ? '已修复' : null,
        cost: i % 3 === 2 ? Math.floor(Math.random() * 2000) + 200 : null,
        completedAt: i % 3 === 2 ? d(2) : null,
      },
    });
  }

  // inspections
  for (let i = 0; i < Math.min(molds.length, 4); i++) {
    await prisma.inspection.create({
      data: {
        moldId: molds[i].id, date: d(i * 30 + 10),
        result: ['合格', '合格', '不合格', '调整周期'][i],
        newCycleValue: i === 3 ? 300000 : null,
        nextDate: d(-90),
        inspector: ['王工', '赵工', '李工', '张工'][i],
        userId: adminId,
      },
    });
  }

  // alerts
  const alertTypes = ['life_warning', 'maintenance_due', 'usage_abnormal', 'inspection_due'];
  for (let i = 0; i < Math.min(molds.length, 8); i++) {
    await prisma.alert.create({
      data: {
        type: alertTypes[i % 4],
        moldId: molds[i % molds.length].id,
        message: [
          `${molds[i % molds.length].moldNo} 寿命已达90%`,
          `${molds[i % molds.length].moldNo} 保养到期`,
          `${molds[i % molds.length].moldNo} 使用量异常`,
          `${molds[i % molds.length].moldNo} 鉴定到期`,
        ][i % 4],
        status: i < 4 ? '未处理' : '已处理',
        handlerId: i >= 4 ? adminId : null,
        handledAt: i >= 4 ? d(1) : null,
      },
    });
  }

  console.log('Extra seed completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
