<template>
  <el-container class="layout">
    <el-aside :width="isCollapse ? '64px' : '220px'">
      <div class="logo">
        <span v-if="!isCollapse">模具管家</span>
        <span v-else>MK</span>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="isCollapse"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#fff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-sub-menu index="/mold">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>模具管理</span>
          </template>
          <el-menu-item index="/mold/list">模具台账</el-menu-item>
          <el-menu-item index="/mold/acceptance">模具验收</el-menu-item>
          <el-menu-item index="/mold/entry">模具录入</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/lifecycle">
          <template #title>
            <el-icon><Timer /></el-icon>
            <span>生命周期</span>
          </template>
          <el-menu-item index="/lifecycle/monitor">寿命监控</el-menu-item>
          <el-menu-item index="/lifecycle/inspection">周期鉴定</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/maintenance">
          <template #title>
            <el-icon><SetUp /></el-icon>
            <span>保养管理</span>
          </template>
          <el-menu-item index="/maintenance/plan">保养计划</el-menu-item>
          <el-menu-item index="/maintenance/record">保养记录</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/repair">
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>维修管理</span>
          </template>
          <el-menu-item index="/repair/order">维修工单</el-menu-item>
          <el-menu-item index="/repair/stats">维修统计</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/borrow">
          <template #title>
            <el-icon><Switch /></el-icon>
            <span>领用管理</span>
          </template>
          <el-menu-item index="/borrow/record">领用/归还记录</el-menu-item>
          <el-menu-item index="/borrow/distribution">当前在用分布</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/customer">
          <template #title>
            <el-icon><User /></el-icon>
            <span>客户产品</span>
          </template>
          <el-menu-item index="/customer/list">客户管理</el-menu-item>
          <el-menu-item index="/customer/product">产品管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/report">
          <el-icon><DataAnalysis /></el-icon>
          <span>报表中心</span>
        </el-menu-item>
        <el-sub-menu index="/alert">
          <template #title>
            <el-icon><Bell /></el-icon>
            <span>告警管理</span>
          </template>
          <el-menu-item index="/alert/list">告警记录</el-menu-item>
          <el-menu-item index="/alert/rule">告警规则配置</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/role">角色权限</el-menu-item>
          <el-menu-item index="/system/dict">数据字典</el-menu-item>
          <el-menu-item index="/system/log">操作日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div class="header-right">
          <span>{{ userStore.userInfo?.name }}</span>
          <el-button text @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.el-aside {
  background: #001529;
  transition: width 0.3s;
  overflow: hidden;
}
.logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #ffffff1a;
}
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20px;
}
.collapse-btn {
  cursor: pointer;
  font-size: 20px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
