import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'catalogo',
        loadComponent: () =>
          import('../pages/catalogo/catalogo.page').then((m) => m.CatalogoPage),
      },
      {
        path: 'mis-contrataciones',
        loadComponent: () =>
          import('../pages/mis-contrataciones/mis-contrataciones.page').then((m) => m.MisContratacionesPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../pages/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: '',
        redirectTo: '/tabs/catalogo',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/catalogo',
    pathMatch: 'full',
  },
];
