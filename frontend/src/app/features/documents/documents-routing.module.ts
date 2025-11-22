import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentListComponent } from './pages/document-list/document-list.component';
import { DocumentDetailComponent } from './pages/document-detail/document-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentListComponent
  },
  {
    path: ':id',
    component: DocumentDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }
