import { PrismaClient } from './generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 角色
  const admin = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: { name: '管理员', code: 'admin', appMode: 'manager', isPreset: true },
  });
  const worker = await prisma.role.upsert({
    where: { code: 'worker' },
    update: {},
    create: { name: '操作工', code: 'worker', appMode: 'worker', isPreset: true },
  });
  await prisma.role.upsert({
    where: { code: 'manager' },
    update: {},
    create: { name: '管理层', code: 'manager', appMode: 'manager', isPreset: true },
  });

  // 默认管理员
  const pwd = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: pwd, name: '系统管理员', roleId: admin.id, status: 1 },
  });
  // 测试操作工
  const wpwd = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { username: 'worker1' },
    update: {},
    create: { username: 'worker1', password: wpwd, name: '张三', roleId: worker.id, workshopId: null, status: 1 },
  });

  // 数据字典
  const dicts = [
    { name: '模具类型', code: 'mold_type', items: ['模压', '口型', '接角'] },
    { name: '车间', code: 'workshop', items: ['挤出车间', '模压车间', '接角车间'] },
    { name: '寿命单位', code: 'life_unit', items: ['米', '模次'] },
    { name: '保养周期单位', code: 'maintenance_unit', items: ['天', '米'] },
  ];
  for (const d of dicts) {
    const dt = await prisma.dictType.upsert({
      where: { code: d.code },
      update: {},
      create: { name: d.name, code: d.code },
    });
    for (let i = 0; i < d.items.length; i++) {
      await prisma.dictItem.upsert({
        where: { id: -1 },
        update: {},
        create: { typeId: dt.id, label: d.items[i], value: d.items[i], sort: i },
      });
    }
  }

  // 告警规则
  const rules = [
    { type: 'life_warning', threshold: '{"percent":[80,90]}' },
    { type: 'maintenance_due', threshold: '{"days":7}' },
    { type: 'usage_abnormal', threshold: '{"multiplier":3}' },
    { type: 'inspection_due', threshold: '{"days":30}' },
  ];
  for (const r of rules) {
    await prisma.alertRule.upsert({
      where: { type: r.type },
      update: {},
      create: { type: r.type, threshold: r.threshold, enabled: true },
    });
  }

  // 客户
  const customers = ['吉利', '三一', '瑞悦', '五菱', '富英华'];
  for (const name of customers) {
    await prisma.customer.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
