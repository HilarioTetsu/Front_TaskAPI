// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LoginView from '../views/auth/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import ProjectsListView from '../views/projects/ProjectsListView.vue';
import ProjectDetailView from '../views/projects/ProjectDetailView.vue';
import InvitationsView from '../views/InvitationsView.vue';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    name: 'projects',
    meta: { requiresAuth: true },
    component: ProjectsListView,
  },
  {
    path: '/projects/:projectId',
    name: 'project-detail',
    meta: { requiresAuth: true },
    component: ProjectDetailView,
  },
  {
    path: '/invitations',
    name: 'invitations',              
    component: InvitationsView,
    meta: { requiresAuth: true },
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  // 1. Verificación proactiva: Si hay token pero está expirado, limpiar todo.
  if (auth.token && auth.isTokenExpired) {
    auth.logout();
    return { name: 'login' };
  }

  // 2. Rutas públicas
  if (to.meta.public) {
    // Si intenta ir a login pero ya está autenticado y válido, mandar a dashboard
    if (auth.isAuthenticated && to.name === 'login') {
        return { name: 'dashboard' };
    }
    return true;
  }

  // 3. Rutas privadas
  const isLogged = auth.isAuthenticated; 
  if (!isLogged) {
    return { name: 'login' };
  }

  return true;
});

export default router;