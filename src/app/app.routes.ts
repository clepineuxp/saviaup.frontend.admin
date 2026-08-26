import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Resumen | SaviaUp Admin',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        title: 'Usuarios | SaviaUp Admin',
        loadComponent: () =>
          import('./features/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'organizations',
        title: 'Organizaciones | SaviaUp Admin',
        loadComponent: () =>
          import('./features/organizations/organizations.component').then(
            (m) => m.OrganizationsComponent,
          ),
      },
      {
        path: 'organizations/:id',
        title: 'Detalle de organización | SaviaUp Admin',
        loadComponent: () =>
          import('./features/organization-detail/organization-detail.component').then(
            (m) => m.OrganizationDetailComponent,
          ),
      },
      {
        path: 'operation',
        title: 'Operación | SaviaUp Admin',
        loadComponent: () =>
          import('./features/operation/operation.component').then((m) => m.OperationComponent),
      },
      {
        path: 'plans',
        title: 'Planes | SaviaUp Admin',
        loadComponent: () =>
          import('./features/plans/plans.component').then((m) => m.PlansComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
