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
    // We will replace 'api/projects' with your actual backend endpoint
    // For now, we use a placeholder to avoid breaking the app.
    const projects$ = this.http.get<ProjectMetrics[]>('/api/projects').pipe(
      tap(projects => this.projectsSignal.set(projects))
    );
    
    // We can subscribe here or use toSignal in the component
    // For now, let's just return the observable and handle it later.
    // In a real app, you might subscribe here to set the signal.
    console.log('Pretending to load projects...');
    // Since we don't have the API yet, let's set some mock data.
    this.projectsSignal.set([
      { id: '1', name: 'Proyecto Alpha', progress: 75, budget: 10000, budgetUsed: 6000, startDate: new Date(), endDate: new Date(), status: 'in-progress', weeklyUpdates: [], kpis: [] },
      { id: '2', name: 'Proyecto Beta', progress: 30, budget: 20000, budgetUsed: 15000, startDate: new Date(), endDate: new Date(), status: 'at-risk', weeklyUpdates: [], kpis: [] },
      { id: '3', name: 'Proyecto Gamma', progress: 100, budget: 5000, budgetUsed: 5000, startDate: new Date(), endDate: new Date(), status: 'completed', weeklyUpdates: [], kpis: [] },
    ]);
  }

  // We can add other methods like scheduleWeeklyTracking later
}