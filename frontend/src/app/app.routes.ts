import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/productos',
    pathMatch: 'full',
  },
  {
    path: 'productos',
    canActivate: [MsalGuard],
    loadComponent: () => import('./views/productos/productos.page').then((m) => m.ProductosPage),
  },
  {
    path: 'clientes',
    canActivate: [MsalGuard],
    loadComponent: () => import('./views/clientes/clientes.page').then((m) => m.ClientesPage),
  },
  {
    path: 'pedidos',
    canActivate: [MsalGuard],
    loadComponent: () => import('./views/pedidos/pedidos.page').then((m) => m.PedidosPage),
  },
  {
    path: '**',
    redirectTo: '/productos',
  },
];