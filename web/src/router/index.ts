import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const Layout = () => import('@/layout/index.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据看板', icon: 'DataBoard' },
      },
    ],
  },
  {
    path: '/mold',
    component: Layout,
    meta: { title: '模具管理', icon: 'Box' },
    children: [
      {
        path: 'list',
        name: 'MoldList',
        component: () => import('@/views/mold/list.vue'),
        meta: { title: '模具台账' },
      },
      {
        path: 'detail/:id',
        name: 'MoldDetail',
        component: () => import('@/views/mold/detail.vue'),
        meta: { title: '模具详情', hidden: true },
      },
      {
        path: 'acceptance',
        name: 'Acceptance',
        component: () => import('@/views/mold/acceptance.vue'),
        meta: { title: '模具验收' },
      },
      {
        path: 'entry',
        name: 'MoldEntry',
        component: () => import('@/views/mold/entry.vue'),
        meta: { title: '模具录入' },
      },
    ],
  },
  {
    path: '/lifecycle',
    component: Layout,
    meta: { title: '生命周期', icon: 'Timer' },
    children: [
      {
        path: 'monitor',
        name: 'LifeMonitor',
        component: () => import('@/views/lifecycle/monitor.vue'),
        meta: { title: '寿命监控' },
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/lifecycle/inspection.vue'),
        meta: { title: '周期鉴定' },
      },
    ],
  },
  {
    path: '/maintenance',
    component: Layout,
    meta: { title: '保养管理', icon: 'SetUp' },
    children: [
      {
        path: 'plan',
        name: 'MaintenancePlan',
        component: () => import('@/views/maintenance/plan.vue'),
        meta: { title: '保养计划' },
      },
      {
        path: 'record',
        name: 'MaintenanceRecord',
        component: () => import('@/views/maintenance/record.vue'),
        meta: { title: '保养记录' },
      },
    ],
  },
  {
    path: '/repair',
    component: Layout,
    meta: { title: '维修管理', icon: 'Tools' },
    children: [
      {
        path: 'order',
        name: 'RepairOrder',
        component: () => import('@/views/repair/order.vue'),
        meta: { title: '维修工单' },
      },
      {
        path: 'stats',
        name: 'RepairStats',
        component: () => import('@/views/repair/stats.vue'),
        meta: { title: '维修统计' },
      },
    ],
  },
  {
    path: '/borrow',
    component: Layout,
    meta: { title: '领用管理', icon: 'Switch' },
    children: [
      {
        path: 'record',
        name: 'BorrowRecord',
        component: () => import('@/views/borrow/record.vue'),
        meta: { title: '领用/归还记录' },
      },
      {
        path: 'distribution',
        name: 'Distribution',
        component: () => import('@/views/borrow/distribution.vue'),
        meta: { title: '当前在用分布' },
      },
    ],
  },
  {
    path: '/customer',
    component: Layout,
    meta: { title: '客户产品', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'CustomerList',
        component: () => import('@/views/customer/list.vue'),
        meta: { title: '客户管理' },
      },
      {
        path: 'product',
        name: 'ProductList',
        component: () => import('@/views/customer/product.vue'),
        meta: { title: '产品管理' },
      },
    ],
  },
  {
    path: '/report',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Report',
        component: () => import('@/views/report/index.vue'),
        meta: { title: '报表中心', icon: 'DataAnalysis' },
      },
    ],
  },
  {
    path: '/alert',
    component: Layout,
    meta: { title: '告警管理', icon: 'Bell' },
    children: [
      {
        path: 'list',
        name: 'AlertList',
        component: () => import('@/views/alert/list.vue'),
        meta: { title: '告警记录' },
      },
      {
        path: 'rule',
        name: 'AlertRule',
        component: () => import('@/views/alert/rule.vue'),
        meta: { title: '告警规则配置' },
      },
    ],
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'role',
        name: 'RoleManage',
        component: () => import('@/views/system/role.vue'),
        meta: { title: '角色权限' },
      },
      {
        path: 'dict',
        name: 'DictManage',
        component: () => import('@/views/system/dict.vue'),
        meta: { title: '数据字典' },
      },
      {
        path: 'log',
        name: 'OperationLog',
        component: () => import('@/views/system/log.vue'),
        meta: { title: '操作日志' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
