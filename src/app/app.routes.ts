import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { roleHomeGuard } from './core/guards/role-home.guard';
import { RoleNames } from './core/config/roles.config';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/private-layout/private-layout').then((m) => m.PrivateLayout),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [roleHomeGuard], children: [] },
      {
        path: 'cliente/pedidos',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Cliente] },
        loadComponent: () =>
          import('./features/requests/pages/customer-orders-page/customer-orders-page').then(
            (m) => m.CustomerOrdersPage
          )
      },
      {
        path: 'cliente/pedidos/:orderId/productos',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Cliente] },
        loadComponent: () =>
          import('./features/requests/pages/order-products-page/order-products-page').then(
            (m) => m.OrderProductsPage
          )
      },
      {
        path: 'cliente/solicitudes',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Cliente] },
        loadComponent: () =>
          import('./features/requests/pages/customer-requests-page/customer-requests-page').then(
            (m) => m.CustomerRequestsPage
          )
      },
      {
        path: 'cliente/solicitudes/nueva',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Cliente] },
        loadComponent: () =>
          import('./features/requests/pages/create-request-page/create-request-page').then(
            (m) => m.CreateRequestPage
          )
      },
      {
        path: 'cliente/solicitudes/:id',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Cliente] },
        loadComponent: () =>
          import('./features/requests/pages/request-detail-page/request-detail-page').then(
            (m) => m.RequestDetailPage
          )
      },
      {
        path: 'admin/dashboard',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Administrador, RoleNames.Analista] },
        loadComponent: () =>
          import('./features/operation/pages/admin-dashboard-page/admin-dashboard-page').then(
            (m) => m.AdminDashboardPage
          )
      },
      {
        path: 'admin/solicitudes',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Administrador, RoleNames.Analista] },
        loadComponent: () =>
          import('./features/operation/pages/admin-requests-page/admin-requests-page').then(
            (m) => m.AdminRequestsPage
          )
      },
      {
        path: 'admin/solicitudes/:id',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Administrador, RoleNames.Analista] },
        loadComponent: () =>
          import('./features/operation/pages/admin-request-detail-page/admin-request-detail-page').then(
            (m) => m.AdminRequestDetailPage
          )
      },
      {
        path: 'proveedor/casos',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Proveedor] },
        loadComponent: () =>
          import('./features/providers/pages/provider-cases-page/provider-cases-page').then(
            (m) => m.ProviderCasesPage
          )
      },
      {
        path: 'proveedor/casos/:id',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Proveedor] },
        loadComponent: () =>
          import(
            './features/providers/pages/provider-case-detail-page/provider-case-detail-page'
          ).then((m) => m.ProviderCaseDetailPage)
      },
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { roles: [RoleNames.Administrador, RoleNames.Analista] },
        loadComponent: () =>
          import('./features/reports/pages/reports-page/reports-page').then((m) => m.ReportsPage)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
