/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/layout/Layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  redirect: '/views/charge/chargeconfig',
  name: 'Table',
  meta: {
    title: 'Table',
    icon: 'table'
  },
  children: [
    {
      path: 'dynamic-table',
      component: () => import('@/views/dashboard/index'),
      name: 'DynamicTable',
      meta: { title: 'dynamicTable' }
    },
    {
      path: 'drag-table',
      component: () => import('@/views/dashboard/index'),
      name: 'DragTable',
      meta: { title: 'dragTable' }
    },
    {
      path: 'inline-edit-table',
      component: () => import('@/views/dashboard/index'),
      name: 'InlineEditTable',
      meta: { title: 'inlineEditTable' }
    },
    {
      path: 'tree-table',
      component: () => import('@/views/dashboard/index'),
      name: 'TreeTableDemo',
      meta: { title: 'treeTable' }
    },
    {
      path: 'custom-tree-table',
      component: () => import('@/views/dashboard/index'),
      name: 'CustomTreeTableDemo',
      meta: { title: 'customTreeTable' }
    },
    {
      path: 'complex-table',
      component: () => import('@/views/dashboard/index'),
      name: 'ComplexTable',
      meta: { title: 'complexTable' },
      children: [
        {
          path: 'dynamic-table',
          component: () => import('@/views/dashboard/index'),
          name: 'DynamicTable',
          meta: { title: '测试' }
        }
      ]

    }
  ]
}
export default tableRouter
