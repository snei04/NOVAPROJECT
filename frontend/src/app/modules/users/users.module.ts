import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';

import { UsersRoutingModule } from './users-routing.module';
import { UsersTableComponent } from './pages/users-table/users-table.component';
import { SharedModule } from '@shared/shared.module';



@NgModule({
  declarations: [
    UsersTableComponent,
    
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    CdkTableModule,
    SharedModule 
  ]
})
export class UsersModule { }
