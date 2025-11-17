import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo.page').then( m => m.CatalogoPage)
  },
  {
    path: 'detalle-plan',
    loadComponent: () => import('./pages/detalle-plan/detalle-plan.page').then( m => m.DetallePlanPage)
  },
  {
    path: 'mis-contrataciones',
    loadComponent: () => import('./pages/mis-contrataciones/mis-contrataciones.page').then( m => m.MisContratacionesPage)
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/asesor/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'crear-plan',
    loadComponent: () => import('./pages/asesor/crear-plan/crear-plan.page').then( m => m.CrearPlanPage)
  },
  {
    path: 'contrataciones-asesor',
    loadComponent: () => import('./pages/asesor/contrataciones-asesor/contrataciones-asesor.page').then( m => m.ContratacionesAsesorPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
];
