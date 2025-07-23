import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTasksPageComponent } from './pages/my-tasks-page/my-tasks-page.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: MyTasksPageComponent }];

@NgModule({
  declarations: [MyTasksPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class MyTasksModule {}