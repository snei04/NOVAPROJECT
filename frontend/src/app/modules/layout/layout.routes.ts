import { Routes } from '@angular/router';
import { AuthGuard } from '@guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'project-dashboard',
    pathMatch: 'full'
  },
  {
    path: 'project-dashboard/create',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../features/project-dashboard/components/create-project-wizard/create-project-wizard.component').then(m => m.CreateProjectWizardComponent),
  },
  {
    path: 'project-dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../features/project-dashboard/project-dashboard.component').then(m => m.ProjectDashboardComponent),
  },
  {
    path: 'dashboard/:boardId',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'boards',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('../boards/boards.routes').then((m) => m.BOARDS_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../profile/pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../users/pages/users-table/users-table.component').then(m => m.UsersTableComponent),
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('../my-tasks/pages/my-tasks-page/my-tasks-page.component').then(m => m.MyTasksPageComponent),
  },
  {
    path: 'stakeholders',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../features/stakeholder-management/components/stakeholder-dashboard/stakeholder-dashboard.component').then(m => m.StakeholderDashboardComponent),
  },
  {
    path: 'risk-management',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../features/risk-management/components/risk-dashboard/risk-dashboard.component').then(m => m.RiskDashboardComponent),
  },
  // Módulo de entregables eliminado - gestión consolidada en Kanban principal
  {
    path: 'budget',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../features/budget/components/budget-dashboard/budget-dashboard.component').then(m => m.BudgetDashboardComponent),
  },
  {
    path: 'budget/:boardId',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../features/budget/components/budget-dashboard/budget-dashboard.component').then(m => m.BudgetDashboardComponent),
  },
  {
    path: 'documents',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('../../features/documents/documents.module').then(m => m.DocumentsModule),
  },

];
// Force recompile