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
    // Aquí iría la lógica para abrir un modal o enviar una actualización.
    console.log('Update submitted for:', project.name);
    this.updateSubmitted.emit({ projectId: project.id, status: 'updated' });
  }
}