// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '@guards/auth.guard';
import { RedirectGuard } from '@guards/redirect.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [ RedirectGuard ],
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'app',
    canActivate: [ AuthGuard ],
    loadComponent: () => 
      import('./modules/layout/components/layout/layout.component').then((m) => m.LayoutComponent),
    loadChildren: () => 
      import('./modules/layout/layout.routes').then((m) => m.LAYOUT_ROUTES),
  },
  // {
  //   path: 'documents',
  //   loadChildren: () => 
  //     import('./features/documents/documents.module').then((m) => m.DocumentsModule),
  // },
];