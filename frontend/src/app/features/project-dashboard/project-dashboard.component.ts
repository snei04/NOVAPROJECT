import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BoardsService } from '../../services/boards.service';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">📂 Mis Proyectos</h1>
            <p class="text-gray-600 mt-2">Selecciona un proyecto para ver su Dashboard de Progreso</p>
          </div>
          <button [routerLink]="['create']" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            ➕ Nuevo Proyecto
          </button>
        </div>

        <\!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500">Cargando proyectos...</p>
        </div>

        <\!-- Empty State -->
        <div *ngIf="\!loading && projects.length === 0" class="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="text-6xl mb-4">📭</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No tienes proyectos activos</h3>
          <p class="text-gray-500 mb-6">Comienza creando tu primer proyecto para gestionar riesgos y entregables.</p>
          <button [routerLink]="['create']" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Crear Primer Proyecto
          </button>
        </div>

        <\!-- Project List -->
        <div *ngIf="\!loading && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div *ngFor="let project of projects" 
               (click)="navigateToDashboard(project.id)"
               class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
            
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {{ project.title.charAt(0).toUpperCase() }}
              </div>
              <span class="text-gray-400 hover:text-gray-600">➡️</span>
            </div>
            
            <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{{ project.title }}</h3>
            <p class="text-gray-500 text-sm mb-4 line-clamp-2">{{ project.description || 'Sin descripción' }}</p>
            
            <div class="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
              <span>Creado el {{ project.created_at | date:'mediumDate' }}</span>
              <span class="text-blue-600 font-medium group-hover:underline">Ver Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectDashboardComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private router = inject(Router);
  
  projects: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.boardsService.loadBoards().subscribe({
      next: (boards) => {
        this.projects = boards;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading projects', err);
        this.loading = false;
      }
    });
  }

  navigateToDashboard(projectId: number) {
    this.router.navigate(['/app/dashboard', projectId]);
  }
}
