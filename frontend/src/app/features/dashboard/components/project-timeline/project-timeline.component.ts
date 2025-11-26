import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectMetrics } from '../../../../core/services/project-tracking.service';

@Component({
  selector: 'app-project-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-timeline.component.html',
})
export class ProjectTimelineComponent {
  @Input() projects: ProjectMetrics[] = [];
  @Output() projectClick = new EventEmitter<ProjectMetrics>();

  onProjectClicked(project: ProjectMetrics) {
    this.projectClick.emit(project);
  }
}