import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectMetrics } from '../../../../core/services/project-tracking.service';

@Component({
  selector: 'app-weekly-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-tracker.component.html',
})
export class WeeklyTrackerComponent {
  @Input() overdueTracks: ProjectMetrics[] = [];
  @Output() updateSubmitted = new EventEmitter<any>();

  submitUpdate(project: ProjectMetrics) {
  console.log('Update submitted for:', project.boardTitle);
  this.updateSubmitted.emit({ projectId: project.boardId, status: 'updated' });
}
}