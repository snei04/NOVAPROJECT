import { Component, OnInit } from '@angular/core';
import { MeService, MyTask } from '@services/me.service';

@Component({
  selector: 'app-my-tasks-page',
  templateUrl: './my-tasks-page.component.html',
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