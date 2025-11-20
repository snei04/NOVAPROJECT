import { Routes } from '@angular/router';
import { AuthGuard } from '@guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'project-dashboard',
    pathMatch: 'full'
  },
  {
    path: 'project-dashboard',
    canActivate: [ AuthGuard ],
    loadComponent: () => 
      import('../../features/project-dashboard/project-dashboard.component').then(m => m.ProjectDashboardComponent),
  },
  {
    path: 'dashboard/:boardId',
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
{
    path: 'stakeholders',
    canActivate: [ AuthGuard ],
    loadComponent: () => 
      import('../../features/stakeholder-management/components/availability-calendar.component').then(m => m.AvailabilityCalendarComponent),
  },
  {
    path: 'risk-management',
    canActivate: [ AuthGuard ],
    loadComponent: () => 
      import('../../features/risk-management/risk-management.component').then(m => m.RiskManagementComponent),
  },
  {
    path: 'deliverable-tracker',
    canActivate: [ AuthGuard ],
    loadComponent: () => 
      import('../../features/deliverable-tracker/deliverable-tracker.component').then(m => m.DeliverableTrackerComponent),
  },

];