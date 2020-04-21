import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

import nestedRouter from './modules/nested'

export const constantRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', noCache: true }
      }
    ]
  }
]
export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
// 关于权限都放在这里
export const asyncRouterMap = [

  {
    path: '/bill',
    component: Layout,
    meta: {
      title: '收费账单管理',
      icon: '账单'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/bill/index'),
        name: 'order',
        meta: { title: '账单管理',  noCache: true },
      },
      {
        path: 'toview/:id',
        component: () => import('@/views/bill/view/toview'),
        name: 'toview',
        meta: { title: '查看账单' },
        hidden: true
      },
      {
        path: 'meter',
        component: () => import('@/views/bill/meter'),
        name: 'meter',
        meta: { title: '抄表记录管理',  noCache: true }
      },
      {
        path: 'payment',
        component: () => import('@/views/bill/payment'),
        name: 'payment',
        meta: { title: '缴费记录查询'}
      }
    ]
  },
  {
    path: '/community',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/community/index'),
        name: 'Icons',
        meta: { title: '小区管理', icon: 'icon', noCache: true }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/community/edit'),
        name: 'edit',
        meta: { title: '查看小区信息', noCache: true },
        hidden: true
      },
      {
        path: 'create',
        component: () => import('@/views/community/create'),
        name: 'create',
        meta: { title: '添加小区', icon: 'list', noCache: true },
        hidden: true
      }
    ]
  },

  {
    path: '/statistical',
    component: Layout,
    meta: {
      title: '报表统计',
      icon: '账单'
    },
    children: [
     
      {
        path: 'dayupdate',
        component: () => import('@/views/statistical/dayupdate'),
        name: 'Dayupdate',
        meta: { title: '日统计', icon: 'list', noCache: true },
      },
      {
        path: 'monthupdate',
        component: () => import('@/views/statistical/monthupdate'),
        name: 'monthupdate',
        meta: { title: '月统计', icon: 'list', noCache: true },
      },
      {
        path: 'yearsupdate',
        component: () => import('@/views/statistical/yearsupdate'),
        name: 'Icons',
        meta: { title: '年统计', icon: 'icon', noCache: true }
      }
    ]
  },
  {
    path: '/spending',
    component: Layout,
    redirect: '/spending/inde',
    name: 'Excel',
    meta: {
      title: '支出管理',
      icon: '管理员'
    },
    children: [
      {
        path: 'spending-excel',
        component: () => import('@/views/spending/index'),
        name: 'spending',
        meta: { title: '支出管理' }
      }
    ]
  },
  {
    path: '/housing',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index/:id(\\d+)',
        component: () => import('@/views/housing/index'),
        name: 'Icons',
        meta: { title: '房屋管理', icon: 'icon', noCache: true }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/housing/edit'),
        name: 'edit',
        meta: { title: '房屋查看', noCache: true },
        hidden: true
      },
      {
        path: 'create',
        component: () => import('@/views/housing/create'),
        name: 'create',
        meta: { title: '房屋添加', icon: 'list', noCache: true },
        hidden: true
      },
      {
        path: 'units/index',
        component: () => import('@/views/housing/units/index'),
        name: 'units',
        meta: { title: '房屋单元', icon: 'list', noCache: true },
        hidden: true
      },
      {
        path: 'owner/index/:id(\\d+)',
        component: () => import('@/views/housing/owner/index'),
        name: 'owner',
        meta: { title: '业主管理', icon: 'list', noCache: true },
        hidden: true
      }
    ]
  },
  {
    path: '/chargemember',
    component: Layout,
    redirect: '/chargemember/inde',
    name: 'Excel',
    meta: {
      title: '收费员管理',
      icon: '管理员'
    },
    children: [
      {
        path: 'chargemember-excel',
        component: () => import('@/views/chargemember/index'),
        name: 'chargemember',
        meta: { title: '收费员管理' }
      }
    ]
  },
  {
    path: '/notice',
    component: Layout,
    redirect: '/notice/index',
    name: 'Excel',
    meta: {
      title: '通知',
      icon: '管理员'
    },
    children: [
      {

        path: 'notice',
        component: () => import('@/views/notice/index'),
        name: 'notice',
        meta: { title: '公告及动态' }
      },
      { path: 'create', component: () => import('@/views/notice/create'), name: 'noticecreate', meta: { title: '创建文章' } },
      { path: 'edit/:id(\\d+)', component: () => import('@/views/notice/edit'), name: 'noticeedit', meta: { title: '修改文章', noCache: true }, hidden: true },
    ]
  },
  {
    path: '/charge',
    component: Layout,
    redirect: '/charge/index',
    name: 'charge',
    meta: {
      title: '收费参数配置',
      icon: '参数',
      roles: ['admin']
    },
    children: [
      {
        path: 'charge/index',
        component: () => import('@/views/charge/index'),
        name: 'charge/list',
        meta: { title: '收费项列表' },
        hidden: true
      },
      {
        path: 'chargeconfig/index',
        component: () => import('@/views/charge/chargeconfig'),
        name: 'chargeconfig',
        meta: { title: '收费分类配置' },
        hidden: true
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/charge/edit'),
        name: 'edit',
        meta: { title: '修改参数项', noCache: true },
        hidden: true
      },
      {
        path: 'create',
        component: () => import('@/views/charge/create'),
        name: 'create',
        meta: { title: '添加参数项', icon: 'list', noCache: true },
        hidden: true
      },
      {
        path: 'list-1',
        component: () => import('@/views/charge/list'),
        name: 'list',
        meta: { title: '关联收费项目', noCache: true },
      },
      {
        path: 'associated',
        component: () => import('@/views/charge/housecharge/index'),
        name: 'associated',
        meta: { title: '账单费项设置', noCache: true }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
