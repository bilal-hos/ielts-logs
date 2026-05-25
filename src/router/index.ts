import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TeachersView from '../views/TeachersView.vue'
import StudentsView from '../views/StudentsView.vue'
import LogsView from '../views/LogsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',          component: DashboardView },
    { path: '/teachers',  component: TeachersView  },
    { path: '/students',  component: StudentsView  },
    { path: '/logs',      component: LogsView      },
  ],
})

export default router
