import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Asumimos que estos componentes se crearán a continuación
import { ProjectTimelineComponent } from '../project-timeline/project-timeline.component';
import { WeeklyTrackerComponent } from '../weekly-tracker/weekly-tracker.component';

import { ProjectTrackingService } from '../../../../core/services/project-tracking.service';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ProjectTimelineComponent, // Descomentar cuando se cree
    WeeklyTrackerComponent,  // Descomentar cuando se cree
  ],
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent {

  private trackingService = inject(ProjectTrackingService);

  // Usamos los signals directamente del servicio
  totalProjects = this.trackingService.totalProjects;
  atRiskCount = this.trackingService.atRiskProjects;
  avgProgress = this.trackingService.avgProgress;
  
  // Lógica para el componente (simplificada por ahora)
  projects = this.trackingService.projects;
  overdueTracking = computed(() => []); // Placeholder

  constructor() {
    // Cargar los datos iniciales
    this.trackingService.loadProjects(); 
  }

  onProjectClick(event: any) {
    console.log('Project clicked:', event);
  }

  onWeeklyUpdate(event: any) {
    console.log('Weekly update submitted:', event);
  }
}