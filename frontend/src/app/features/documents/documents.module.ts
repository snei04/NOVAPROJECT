import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { DocumentsRoutingModule } from './documents-routing.module';

// Components
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { EditorComponent } from './components/editor/editor.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { DatabaseViewComponent } from './components/database-view/database-view.component';

// Pages
import { DocumentListComponent } from './pages/document-list/document-list.component';
import { DocumentDetailComponent } from './pages/document-detail/document-detail.component';
import { ShareDialogComponent } from './components/share-dialog/share-dialog.component';

@NgModule({
  declarations: [
    SidebarComponent,
    EditorComponent,
    MenuBarComponent,
    DatabaseViewComponent,
    DocumentListComponent,
    DocumentDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DocumentsRoutingModule,
    ShareDialogComponent
  ],
  exports: [
    SidebarComponent
  ]
})
export class DocumentsModule { }
