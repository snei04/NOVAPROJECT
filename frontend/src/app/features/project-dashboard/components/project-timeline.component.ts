import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-timeline">
      <div class="timeline-container">
        @for (milestone of milestones; track milestone.id) {
          <div class="milestone-item" [class]="getMilestoneClass(milestone)">
            <div class="milestone-connector">
              <div class="connector-line" [class.completed]="milestone.status === 'completed'"></div>
              <div class="milestone-dot" [class]="getDotClass(milestone)">
                <span class="milestone-icon">{{ getMilestoneIcon(milestone) }}</span>
              </div>
            </div>
            
            <div class="milestone-content">
              <div class="milestone-header">
                <h4 class="milestone-title">{{ milestone.title }}</h4>
                <div class="milestone-meta">
                  <span class="milestone-date">📅 {{ milestone.targetDate | date:'dd/MM/yyyy' }}</span>
                  <span class="milestone-assignee">👤 {{ milestone.assignee }}</span>
                </div>
              </div>
              
              <p class="milestone-description">{{ milestone.description }}</p>
              
              <div class="milestone-progress">
                <div class="progress-header">
                  <span class="progress-label">Progreso</span>
                  <span class="progress-value">{{ milestone.progress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       [style.width.%]="milestone.progress"
                       [class]="getProgressClass(milestone)">
                  </div>
                </div>
              </div>
              
              @if (milestone.deliverables && milestone.deliverables.length > 0) {
                <div class="milestone-deliverables">
                  <h5 class="deliverables-title">📋 Entregables:</h5>
                  <div class="deliverables-list">
                    @for (deliverable of milestone.deliverables; track deliverable) {
                      <span class="deliverable-tag">{{ deliverable }}</span>
                    }
                  </div>
                </div>
              }
              
              @if (milestone.dependencies && milestone.dependencies.length > 0) {
                <div class="milestone-dependencies">
                  <h5 class="dependencies-title">🔗 Dependencias:</h5>
                  <div class="dependencies-list">
                    @for (dep of milestone.dependencies; track dep) {
                      <span class="dependency-tag">{{ getDependencyTitle(dep) }}</span>
                    }
                  </div>
                </div>
              }
              
              <div class="milestone-actions">
                <button 
                  class="btn-update"
                  (click)="onUpdateMilestone(milestone)"
                  [disabled]="milestone.status === 'completed'"
                >
                  {{ milestone.status === 'completed' ? '✅ Completado' : '📝 Actualizar' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
      
      <!-- Timeline Legend -->
      <div class="timeline-legend mt-6">
        <h4 class="legend-title">Leyenda:</h4>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-dot completed"></div>
            <span>Completado</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot in-progress"></div>
            <span>En Progreso</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot pending"></div>
            <span>Pendiente</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot overdue"></div>
            <span>Vencido</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .project-timeline {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .timeline-container {
      position: relative;
    }

    .milestone-item {
      display: flex;
      margin-bottom: 2rem;
      position: relative;
    }

    .milestone-item:last-child .connector-line {
      display: none;
    }

    .milestone-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 1.5rem;
      position: relative;
    }

    .connector-line {
      width: 2px;
      height: 100%;
      background: #e5e7eb;
      position: absolute;
      top: 2rem;
      z-index: 1;
    }

    .connector-line.completed {
      background: #10b981;
    }

    .milestone-dot {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      border: 3px solid;
    }

    .milestone-dot.completed {
      background: #10b981;
      border-color: #059669;
      color: white;
    }

    .milestone-dot.in-progress {
      background: #3b82f6;
      border-color: #2563eb;
      color: white;
    }

    .milestone-dot.pending {
      background: #f3f4f6;
      border-color: #9ca3af;
      color: #6b7280;
    }

    .milestone-dot.overdue {
      background: #ef4444;
      border-color: #dc2626;
      color: white;
    }

    .milestone-icon {
      font-size: 1.25rem;
    }

    .milestone-content {
      flex: 1;
      background: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
    }

    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .milestone-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .milestone-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.75rem;
      color: #6b7280;
      gap: 0.25rem;
    }

    .milestone-description {
      color: #4b5563;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .milestone-progress {
      margin-bottom: 1rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .progress-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .progress-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #111827;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.6s ease;
      border-radius: 4px;
    }

    .progress-fill.success {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .progress-fill.warning {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .progress-fill.danger {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .progress-fill.info {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .milestone-deliverables,
    .milestone-dependencies {
      margin-bottom: 1rem;
    }

    .deliverables-title,
    .dependencies-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .deliverables-list,
    .dependencies-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .deliverable-tag,
    .dependency-tag {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .dependency-tag {
      background: #fef3c7;
      color: #92400e;
    }

    .milestone-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-update {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn-update:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-update:disabled {
      background: #10b981;
      cursor: not-allowed;
    }

    .timeline-legend {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .legend-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
    }

    .legend-items {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .legend-dot {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 2px solid;
    }

    .legend-dot.completed {
      background: #10b981;
      border-color: #059669;
    }

    .legend-dot.in-progress {
      background: #3b82f6;
      border-color: #2563eb;
    }

    .legend-dot.pending {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .legend-dot.overdue {
      background: #ef4444;
      border-color: #dc2626;
    }

    /* Animaciones */
    .milestone-item {
      animation: slideInLeft 0.6s ease-out;
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .progress-fill {
      animation: fillProgress 1s ease-out 0.5s both;
    }

    @keyframes fillProgress {
      from {
        width: 0;
      }
    }
  `]
})
export class ProjectTimelineComponent {
  @Input() milestones: any[] = [];
  @Input() dependencies: any[] = [];
  @Input() currentProgress: number = 0;
  @Output() milestoneUpdate = new EventEmitter<any>();

  getMilestoneClass(milestone: any): string {
    return `milestone-${milestone.status}`;
  }

  getDotClass(milestone: any): string {
    if (milestone.status === 'completed') return 'completed';
    if (milestone.status === 'in_progress') return 'in-progress';
    if (milestone.status === 'overdue') return 'overdue';
    return 'pending';
  }

  getMilestoneIcon(milestone: any): string {
    switch (milestone.status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'overdue': return '⚠️';
      default: return '⏳';
    }
  }

  getProgressClass(milestone: any): string {
    if (milestone.progress >= 80) return 'success';
    if (milestone.progress >= 60) return 'info';
    if (milestone.progress >= 40) return 'warning';
    return 'danger';
  }

  getDependencyTitle(dependencyId: string): string {
    const milestone = this.milestones.find(m => m.id === dependencyId);
    return milestone ? milestone.title : dependencyId;
  }

  onUpdateMilestone(milestone: any) {
    this.milestoneUpdate.emit(milestone);
  }
}
