import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

// Define the interfaces for your data models here or import them
export interface WeeklyUpdate {
  date: Date;
  summary: string;
}

export interface KPI {
  name: string;
  value: number;
  target: number;
}

export interface ProjectMetrics {
  id: string;
  name: string;
  progress: number;
  budget: number;
  budgetUsed: number;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'in-progress' | 'at-risk' | 'completed';
  weeklyUpdates: WeeklyUpdate[];
  kpis: KPI[];
}

@Injectable({ providedIn: 'root' })
export class ProjectTrackingService {
  private http = inject(HttpClient);

  // State Signal
  private projectsSignal = signal<ProjectMetrics[]>([]);

  // Public Readonly Signals
  public projects = this.projectsSignal.asReadonly();
  
  // Computed signals for automatic metrics
  public totalProjects = computed(() => this.projectsSignal().length);
  public atRiskProjects = computed(() => 
    this.projectsSignal().filter(p => p.status === 'at-risk').length
  );
  public avgProgress = computed(() => {
    const projects = this.projectsSignal();
    return projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0;
  });

  // Method to load project data from the backend
  loadProjects() {
    // AHORA HACEMOS UNA LLAMADA REAL A LA API
    // El proxy se encarga de redirigir /api/* a tu backend
    this.http.get<ProjectMetrics[]>('/api/projects/dashboard') // Asumiendo un endpoint que devuelve todos los dashboards
      .subscribe({
        next: (projects) => {
          this.projectsSignal.set(projects); // Actualizamos el signal con los datos reales
        },
        error: (err) => {
          console.error('Error al cargar los proyectos:', err);
          this.projectsSignal.set([]); // En caso de error, vaciamos la lista
        }
      });
  }
}
