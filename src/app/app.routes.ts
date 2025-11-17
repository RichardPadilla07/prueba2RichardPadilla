import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { usuarioRegistradoGuard, asesorComercialGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/pages/catalogo',
    pathMatch: 'full'
  },
  {
    path: 'pages',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
      },
      {
        path: 'catalogo',
        loadComponent: () => import('./pages/catalogo/catalogo.page').then(m => m.CatalogoPage)
      },
      {
        path: 'detalle-plan/:id',
        loadComponent: () => import('./pages/detalle-plan/detalle-plan.page').then(m => m.DetallePlanPage)
      },
      {
        path: 'mis-contrataciones',
        loadComponent: () => import('./pages/mis-contrataciones/mis-contrataciones.page').then(m => m.MisContratacionesPage),
        canActivate: [usuarioRegistradoGuard]
      },
      {
        path: 'chat/:id',
        loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage),
        canActivate: [authGuard]
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
        canActivate: [authGuard]
      },
      {
        path: 'asesor',
        canActivate: [asesorComercialGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/asesor/dashboard/dashboard.page').then(m => m.DashboardPage)
          },
          {
            path: 'crear-plan',
            loadComponent: () => import('./pages/asesor/crear-plan/crear-plan.page').then(m => m.CrearPlanPage)
          },
          {
            path: 'crear-plan/:id',
            loadComponent: () => import('./pages/asesor/crear-plan/crear-plan.page').then(m => m.CrearPlanPage)
          },
          {
            path: 'contrataciones-asesor',
            loadComponent: () => import('./pages/asesor/contrataciones-asesor/contrataciones-asesor.page').then(m => m.ContratacionesAsesorPage)
          }
        ]
      }
    ]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard]
  }
];
