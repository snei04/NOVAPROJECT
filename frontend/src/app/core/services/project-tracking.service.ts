import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Observable } from 'rxjs';

// --- INTERFAZ DE DATOS CORREGIDA ---
export interface ProjectMetrics {
  boardId: string;
  boardTitle: string;
  totalCards: number;
  completedCards: number;
  progress: number;
  status?: 'in-progress' | 'at-risk' | 'completed'; // Asumimos que el backend puede enviar esto
}

@Injectable({ providedIn: 'root' })
export class ProjectTrackingService {
  private http = inject(HttpClient);

  // --- SIGNALS DE ESTADO ---
  private dashboardDataSignal = signal<ProjectMetrics | null>(null);
  private selectedStatus = signal<'all' | 'in-progress' | 'at-risk' | 'completed'>('all');

  // --- SIGNALS PÚBLICOS Y CALCULADOS ---
  public projects = computed(() => {
    const data = this.dashboardDataSignal();
    return data ? [data] : []; // Previene valores nulos en el array
  });
  
  public filteredProjects = computed(() => {
    const projects = this.projects(); // Usa el signal que ya previene nulos
    const status = this.selectedStatus();
    if (status === 'all' || !status) {
      return projects;
    }
    return projects.filter(p => p.status === status);
  });
  
  public totalProjects = computed(() => this.projects().length);
  
  public atRiskProjects = computed(() => 
    this.projects().filter(p => p.status === 'at-risk').length
  );
  
  public avgProgress = computed(() => this.dashboardDataSignal()?.progress || 0);

  // --- MÉTODOS PÚBLICOS ---
  getBoardDashboard(boardId: string): Observable<ProjectMetrics> {
    const url = `/api/boards/${boardId}/dashboard`;
    return this.http.get<ProjectMetrics>(url).pipe(
      tap(data => this.dashboardDataSignal.set(data))
    );
  }

  filterByStatus(status: 'all' | 'in-progress' | 'at-risk' | 'completed') {
    this.selectedStatus.set(status);
  }
}