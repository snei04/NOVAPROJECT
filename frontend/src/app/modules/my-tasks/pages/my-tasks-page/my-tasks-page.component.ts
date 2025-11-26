import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { MeService, MyTask } from '@services/me.service';

@Component({
  selector: 'app-my-tasks-page',
  templateUrl: './my-tasks-page.component.html',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
})
export class MyTasksPageComponent implements OnInit {
  myTasks: MyTask[] = [];

  constructor(private meService: MeService) {}

  ngOnInit(): void {
    this.meService.getMyTasks().subscribe(tasks => {
      this.myTasks = tasks;
    });
  }
}