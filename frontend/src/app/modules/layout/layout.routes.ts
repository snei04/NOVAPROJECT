import { Routes } from '@angular/router';
import { AuthGuard } from '@guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard', // <-- CAMBIO 1
    pathMatch: 'full'
  },
  {
    path: 'dashboard', // <-- CAMBIO 2: RUTA AÑADIDA
    canActivate: [ AuthGuard ],
    loadComponent: () => 
      import('../../features/dashboard/components/progress-dashboard/progress-dashboard.component').then(m => m.ProgressDashboardComponent),
  },
  {
    path: 'boards',
    canActivate: [ AuthGuard ],
    loadChildren: () =>
      import('../boards/boards.routes').then((m) => m.BOARDS_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [ AuthGuard ],
    loadComponent: () =>
      import('../profile/pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'users',
    canActivate: [ AuthGuard ],
    loadComponent: () =>
      import('../users/pages/users-table/users-table.component').then(m => m.UsersTableComponent),
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('../my-tasks/pages/my-tasks-page/my-tasks-page.component').then(m => m.MyTasksPageComponent),
  },
];