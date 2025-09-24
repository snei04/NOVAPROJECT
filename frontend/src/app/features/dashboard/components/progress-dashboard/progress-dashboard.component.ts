import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // <-- 1. IMPORTA ActivatedRoute y Router

// Asumimos que estos componentes se crearán a continuación
import { ProjectTimelineComponent } from '../project-timeline/project-timeline.component';
import { WeeklyTrackerComponent } from '../weekly-tracker/weekly-tracker.component';

import { ProjectTrackingService, ProjectMetrics } from '../../../../core/services/project-tracking.service';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ProjectTimelineComponent,
    WeeklyTrackerComponent,
  ],
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit {

  private trackingService = inject(ProjectTrackingService);
  private route = inject(ActivatedRoute); // <-- 2. INYECTA ActivatedRoute
  private router = inject(Router); // <-- Inyecta Router para la navegación

  // Usamos los signals directamente del servicio
  totalProjects = this.trackingService.totalProjects;
  atRiskCount = this.trackingService.atRiskProjects;
  avgProgress = this.trackingService.avgProgress;
  projects = this.trackingService.filteredProjects; // Apuntamos al signal filtrado
  overdueTracking = computed(() => []); // Placeholder

  // El constructor ahora está vacío o se usa para inyecciones
  constructor() {}

  // 3. LA LÓGICA DE CARGA AHORA ESTÁ EN ngOnInit
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const boardId = params.get('boardId'); // Asegúrate que el parámetro en la ruta se llame 'boardId'
      if (boardId) {
        this.trackingService.getBoardDashboard(boardId).subscribe();
      }
    });
  }

 onProjectClick(project: ProjectMetrics) {
  this.router.navigate(['/app/boards', project.boardId]); // <-- CORREGIDO
}

  onWeeklyUpdate(event: any) {
    console.log('Weekly update submitted:', event);
  }

  filterProjects(status: 'all' | 'in-progress' | 'at-risk' | 'completed') {
    this.trackingService.filterByStatus(status);
  }
}