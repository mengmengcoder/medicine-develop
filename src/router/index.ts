import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: '/virtual-screening',
        name: 'VirtualScreening',
        component: () => import('@/views/VirtualScreening/index.vue'),
        redirect: '/virtual-screening/compound-library',
        meta: { title: '虚拟筛选', icon: 'Search' },
        children: [
          {
            path: '/virtual-screening/compound-library',
            name: 'CompoundLibrary',
            component: () => import('@/views/VirtualScreening/CompoundLibrary.vue'),
            meta: { title: '化合物库管理', icon: 'Database' }
          },
          {
            path: '/virtual-screening/screening-config',
            name: 'ScreeningConfig',
            component: () => import('@/views/VirtualScreening/ScreeningConfig.vue'),
            meta: { title: '筛选配置', icon: 'Setting' }
          },
          {
            path: '/virtual-screening/task-monitor',
            name: 'TaskMonitor',
            component: () => import('@/views/VirtualScreening/TaskMonitor.vue'),
            meta: { title: '任务监控', icon: 'Monitor' }
          },
          {
            path: '/virtual-screening/result-analysis',
            name: 'ResultAnalysis',
            component: () => import('@/views/VirtualScreening/ResultAnalysis.vue'),
            meta: { title: '结果分析', icon: 'DataAnalysis' }
          }
        ]
      },
      {
        path: '/molecule-generation',
        name: 'MoleculeGeneration',
        component: () => import('@/views/MoleculeGeneration/index.vue'),
        redirect: '/molecule-generation/model-management',
        meta: { title: '分子生成', icon: 'MagicStick' },
        children: [
          {
            path: '/molecule-generation/model-management',
            name: 'ModelManagement',
            component: () => import('@/views/MoleculeGeneration/ModelManagement.vue'),
            meta: { title: '模型管理', icon: 'Box' }
          },
          {
            path: '/molecule-generation/generation-task',
            name: 'GenerationTask',
            component: () => import('@/views/MoleculeGeneration/GenerationTask.vue'),
            meta: { title: '生成任务', icon: 'Lightning' }
          },
          {
            path: '/molecule-generation/result-display',
            name: 'ResultDisplay',
            component: () => import('@/views/MoleculeGeneration/ResultDisplay.vue'),
            meta: { title: '结果展示', icon: 'View' }
          },
          {
            path: '/molecule-generation/molecule-editor',
            name: 'MoleculeEditor',
            component: () => import('@/views/MoleculeGeneration/MoleculeEditor.vue'),
            meta: { title: '分子编辑', icon: 'Edit' }
          }
        ]
      },
      {
        path: '/multi-objective-optimization',
        name: 'MultiObjectiveOptimization',
        component: () => import('@/views/MultiObjectiveOptimization/index.vue'),
        redirect: '/multi-objective-optimization/objective-config',
        meta: { title: '多目标优化', icon: 'Aim' },
        children: [
          {
            path: '/multi-objective-optimization/objective-config',
            name: 'ObjectiveConfig',
            component: () => import('@/views/MultiObjectiveOptimization/ObjectiveConfig.vue'),
            meta: { title: '目标配置', icon: 'Compass' }
          },
          {
            path: '/multi-objective-optimization/algorithm-selection',
            name: 'AlgorithmSelection',
            component: () => import('@/views/MultiObjectiveOptimization/AlgorithmSelection.vue'),
            meta: { title: '算法选择', icon: 'Operation' }
          },
          {
            path: '/multi-objective-optimization/optimization-monitor',
            name: 'OptimizationMonitor',
            component: () => import('@/views/MultiObjectiveOptimization/OptimizationMonitor.vue'),
            meta: { title: '优化监控', icon: 'TrendCharts' }
          },
          {
            path: '/multi-objective-optimization/result-analysis',
            name: 'OptimizationResultAnalysis',
            component: () => import('@/views/MultiObjectiveOptimization/ResultAnalysis.vue'),
            meta: { title: '结果分析', icon: 'PieChart' }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', hideInMenu: true, requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', hideInMenu: true, requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { title: '页面不存在', hideInMenu: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 药物研发平台` : '药物研发平台'
  
  // 导入认证store
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  
  // 初始化认证状态
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  // 检查是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const isAuthPage = to.name === 'Login' || to.name === 'Register' || to.name === 'ResetPassword'
  
  if (requiresAuth && !authStore.isAuthenticated && !isAuthPage) {
    // 需要认证但未登录，重定向到登录页
    next({ name: 'Login' })
  } else if (isAuthPage && authStore.isAuthenticated) {
    // 已登录但访问认证页面，重定向到首页
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router