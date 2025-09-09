import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@guards/auth.guard';
import { RedirectGuard } from '@guards/redirect.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [ RedirectGuard ],
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
  path: 'app',
  canActivate: [ AuthGuard ],
  // 1. Carga el componente Standalone
  loadComponent: () => 
    import('./modules/layout/components/layout/layout.component').then((m) => m.LayoutComponent),
  // 2. Carga sus rutas hijas desde el archivo de rutas que modificamos
  loadChildren: () => 
    import('./modules/layout/layout.routes').then((m) => m.LAYOUT_ROUTES),
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
