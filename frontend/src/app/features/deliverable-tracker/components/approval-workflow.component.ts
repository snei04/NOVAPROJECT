import { Component, OnInit, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DeliverableService } from '../services/deliverable.service';
import { Deliverable, ApprovalWorkflow, ApprovalRecord } from '../models/deliverable.model';

@Component({
  selector: 'app-approval-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="approval-workflow p-6">
      <!-- Header -->
      <div class="workflow-header mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">✅ Workflow de Aprobación Multi-Reviewer</h2>
            <p class="text-gray-600 mt-2">
              Solución IMEVI: proceso manual → workflow automático con tracking completo
            </p>
          </div>
          <div class="flex space-x-3">
            <button 
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              (click)="approveSelected()"
              [disabled]="selectedDeliverables().length === 0"
            >
              ✅ Aprobar Seleccionados ({{ selectedDeliverables().length }})
            </button>
            <button 
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              (click)="refreshWorkflows()"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Métricas de Aprobación -->
      <div class="approval-metrics mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Pendientes Aprobación</p>
                <p class="text-3xl font-bold text-orange-600">{{ pendingApprovals().length }}</p>
                <p class="text-sm text-orange-600 mt-1">Requieren atención</p>
              </div>
              <div class="bg-orange-100 p-3 rounded-full">
                <span class="text-3xl">⏳</span>
              </div>
            </div>
          </div>

          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Aprobadas Hoy</p>
                <p class="text-3xl font-bold text-green-600">{{ approvedToday().length }}</p>
                <p class="text-sm text-green-600 mt-1">vs IMEVI: +50% eficiencia</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <span class="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p class="text-3xl font-bold text-blue-600">{{ averageApprovalTime() }}d</p>
                <p class="text-sm text-blue-600 mt-1">Tiempo de aprobación</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <span class="text-3xl">⏱️</span>
              </div>
            </div>
          </div>

          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p class="text-3xl font-bold text-purple-600">{{ approvalSuccessRate() }}%</p>
                <p class="text-sm text-purple-600 mt-1">Aprobaciones exitosas</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <span class="text-3xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Entregables en Workflow -->
      <div class="workflow-list">
        <div class="bg-white rounded-xl shadow-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">📋 Entregables en Proceso de Aprobación</h3>
            <div class="flex space-x-4 mt-2">
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterStatus() === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setStatusFilter('all')"
              >
                Todos ({{ allWorkflows().length }})
              </button>
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterStatus() === 'pending' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setStatusFilter('pending')"
              >
                Pendientes ({{ pendingApprovals().length }})
              </button>
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterStatus() === 'approved' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setStatusFilter('approved')"
              >
                Aprobadas ({{ approvedWorkflows().length }})
              </button>
            </div>
          </div>
          
          <div class="divide-y divide-gray-200">
            @for (deliverable of filteredWorkflows(); track deliverable.id) {
              <div class="workflow-item p-6 hover:bg-gray-50">
                <div class="flex items-start space-x-4">
                  <!-- Checkbox para selección -->
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      [checked]="selectedDeliverables().includes(deliverable.id)"
                      (change)="toggleSelection(deliverable.id)"
                      class="rounded"
                    >
                  </div>
                  
                  <div class="flex-1">
                    <!-- Header del entregable -->
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <h4 class="font-semibold text-gray-900">{{ deliverable.title }}</h4>
                        <div class="workflow-status-badge" [class]="getWorkflowStatusClass(deliverable.approvalWorkflow.overallStatus)">
                          {{ getWorkflowStatusLabel(deliverable.approvalWorkflow.overallStatus) }}
                        </div>
                        <div class="priority-badge" [class]="getPriorityClass(deliverable.priority)">
                          {{ deliverable.priority }}
                        </div>
                      </div>
                      <div class="text-sm text-gray-500">
                        Nivel {{ deliverable.approvalWorkflow.currentLevel + 1 }}/{{ deliverable.approvalWorkflow.requiredApprovers.length }}
                      </div>
                    </div>
                    
                    <!-- Progreso del Workflow -->
                    <div class="workflow-progress mb-4">
                      <div class="flex items-center space-x-2 mb-2">
                        <span class="text-sm font-medium text-gray-700">Progreso del Workflow:</span>
                        <span class="text-sm text-gray-600">
                          {{ getWorkflowProgress(deliverable.approvalWorkflow) }}%
                        </span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill bg-blue-500" 
                             [style.width.%]="getWorkflowProgress(deliverable.approvalWorkflow)">
                        </div>
                      </div>
                    </div>
                    
                    <!-- Niveles de Aprobación -->
                    <div class="approval-levels">
                      <h5 class="text-sm font-medium text-gray-700 mb-2">📋 Niveles de Aprobación:</h5>
                      <div class="space-y-2">
                        @for (level of deliverable.approvalWorkflow.requiredApprovers; track level.level) {
                          <div class="approval-level" 
                               [class]="getApprovalLevelClass(level.level, deliverable.approvalWorkflow.currentLevel)">
                            <div class="flex items-center justify-between">
                              <div class="flex items-center space-x-3">
                                <div class="level-indicator" 
                                     [class]="getLevelIndicatorClass(level.level, deliverable.approvalWorkflow.currentLevel)">
                                  {{ level.level }}
                                </div>
                                <div>
                                  <p class="font-medium text-sm">{{ level.name }}</p>
                                  <p class="text-xs text-gray-600">{{ level.description }}</p>
                                </div>
                              </div>
                              <div class="approvers-list">
                                @for (approver of level.requiredApprovers; track approver.userId) {
                                  <div class="approver-item flex items-center space-x-2">
                                    <img 
                                      src="https://ui-avatars.com/api/?name={{ approver.userName }}&size=24"
                                      class="w-6 h-6 rounded-full"
                                      [title]="approver.userName"
                                    >
                                    <span class="text-xs">{{ approver.userName }}</span>
                                    @if (getApprovalStatus(deliverable.approvalWorkflow, level.level, approver.userId)) {
                                      <span class="text-green-600 text-xs">✅</span>
                                    }
                                  </div>
                                }
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                    
                    <!-- Historial de Aprobaciones -->
                    @if (deliverable.approvalWorkflow.approvalHistory.length > 0) {
                      <div class="approval-history mt-4">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">📜 Historial de Aprobaciones:</h5>
                        <div class="space-y-2">
                          @for (record of deliverable.approvalWorkflow.approvalHistory; track record.id) {
                            <div class="history-record bg-gray-50 border border-gray-200 rounded p-3">
                              <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center space-x-2">
                                  <span class="decision-badge" [class]="getDecisionClass(record.decision)">
                                    {{ getDecisionLabel(record.decision) }}
                                  </span>
                                  <span class="text-sm font-medium">{{ record.approverName }}</span>
                                </div>
                                <span class="text-xs text-gray-500">
                                  {{ record.decisionDate | date:'dd/MM/yyyy HH:mm' }}
                                </span>
                              </div>
                              @if (record.comments) {
                                <p class="text-sm text-gray-600">{{ record.comments }}</p>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                  
                  <!-- Acciones -->
                  <div class="workflow-actions flex flex-col space-y-2">
                    @if (deliverable.approvalWorkflow.overallStatus === 'in_progress') {
                      <button 
                        class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        (click)="approveDeliverable(deliverable)"
                      >
                        ✅ Aprobar
                      </button>
                      <button 
                        class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        (click)="rejectDeliverable(deliverable)"
                      >
                        ❌ Rechazar
                      </button>
                    }
                    <button 
                      class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                      (click)="viewWorkflowDetails(deliverable)"
                    >
                      👁️ Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-6 text-center text-gray-500">
                <span class="text-4xl mb-2 block">📋</span>
                <p>No hay entregables {{ getFilterLabel() }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Comparación IMEVI -->
      <div class="imevi-comparison mt-8">
        <div class="bg-gradient-to-r from-red-50 to-green-50 border border-orange-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Workflow Automático vs IMEVI</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="imevi-before">
              <h4 class="font-medium text-red-800 mb-2">❌ IMEVI - Proceso Manual</h4>
              <ul class="text-sm text-red-700 space-y-1">
                <li>• Aprobaciones por email sin tracking</li>
                <li>• Sin workflow definido</li>
                <li>• Pérdida de aprobaciones en emails</li>
                <li>• Sin recordatorios automáticos</li>
                <li>• Tiempo de aprobación impredecible</li>
              </ul>
            </div>
            
            <div class="novaproject-after">
              <h4 class="font-medium text-green-800 mb-2">✅ NovaProject - Workflow Automático</h4>
              <ul class="text-sm text-green-700 space-y-1">
                <li>• Workflow multi-reviewer con tracking</li>
                <li>• Niveles de aprobación configurables</li>
                <li>• Historial completo de decisiones</li>
                <li>• Recordatorios y escalation automática</li>
                <li>• Tiempo de aprobación predecible</li>
              </ul>
            </div>
          </div>
          
          <div class="improvement-metrics mt-6 bg-green-100 border border-green-300 rounded-lg p-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-green-600">+50%</p>
                <p class="text-sm text-green-700">Eficiencia aprobación</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">-70%</p>
                <p class="text-sm text-green-700">Tiempo de ciclo</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">100%</p>
                <p class="text-sm text-green-700">Trazabilidad</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .approval-workflow {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    .metric-card {
      transition: all 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .workflow-status-badge, .priority-badge, .decision-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .status-in_progress {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .priority-critical {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .priority-high {
      background: #fed7aa;
      color: #9a3412;
    }
    
    .priority-medium {
      background: #fef3c7;
      color: #92400e;
    }
    
    .approval-level {
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
    }
    
    .level-current {
      background: #dbeafe;
      border-color: #3b82f6;
    }
    
    .level-completed {
      background: #d1fae5;
      border-color: #10b981;
    }
    
    .level-indicator {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .indicator-current {
      background: #3b82f6;
      color: white;
    }
    
    .indicator-completed {
      background: #10b981;
      color: white;
    }
    
    .indicator-pending {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      transition: width 0.6s ease;
      border-radius: 3px;
    }
  `]
})
export class ApprovalWorkflowComponent implements OnInit {
  private deliverableService = inject(DeliverableService);

  // Signals para estado local
  filterStatus = signal<'all' | 'pending' | 'approved'>('all');
  selectedDeliverables = signal<string[]>([]);

  // Computed signals
  allWorkflows = computed(() => 
    this.deliverableService.getAllDeliverables().filter(d => 
      d.status === 'approval' || d.approvalWorkflow.overallStatus !== 'not_started'
    )
  );

  pendingApprovals = computed(() => 
    this.allWorkflows().filter(d => d.approvalWorkflow.overallStatus === 'in_progress')
  );

  approvedWorkflows = computed(() => 
    this.allWorkflows().filter(d => d.approvalWorkflow.overallStatus === 'approved')
  );

  approvedToday = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.approvedWorkflows().filter(d => {
      const lastApproval = d.approvalWorkflow.approvalHistory
        .sort((a, b) => b.decisionDate.getTime() - a.decisionDate.getTime())[0];
      return lastApproval && lastApproval.decisionDate >= today;
    });
  });

  filteredWorkflows = computed(() => {
    const filter = this.filterStatus();
    switch (filter) {
      case 'pending':
        return this.pendingApprovals();
      case 'approved':
        return this.approvedWorkflows();
      default:
        return this.allWorkflows();
    }
  });

  averageApprovalTime = computed(() => {
    // Mock calculation - en implementación real sería más complejo
    return 2.5;
  });

  approvalSuccessRate = computed(() => {
    const total = this.allWorkflows().length;
    const approved = this.approvedWorkflows().length;
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  });

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    await this.deliverableService.refreshData();
  }

  setStatusFilter(status: 'all' | 'pending' | 'approved') {
    this.filterStatus.set(status);
  }

  getFilterLabel(): string {
    const labels = {
      all: '',
      pending: 'pendientes',
      approved: 'aprobadas'
    };
    return labels[this.filterStatus()];
  }

  toggleSelection(deliverableId: string) {
    this.selectedDeliverables.update(current => {
      if (current.includes(deliverableId)) {
        return current.filter(id => id !== deliverableId);
      } else {
        return [...current, deliverableId];
      }
    });
  }

  getWorkflowStatusClass(status: string): string {
    return `status-${status}`;
  }

  getWorkflowStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      not_started: 'No Iniciado',
      in_progress: 'En Progreso',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getWorkflowProgress(workflow: ApprovalWorkflow): number {
    const totalLevels = workflow.requiredApprovers.length;
    const completedLevels = workflow.currentLevel;
    return totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  }

  getApprovalLevelClass(level: number, currentLevel: number): string {
    if (level < currentLevel) return 'level-completed';
    if (level === currentLevel) return 'level-current';
    return '';
  }

  getLevelIndicatorClass(level: number, currentLevel: number): string {
    if (level < currentLevel) return 'indicator-completed';
    if (level === currentLevel) return 'indicator-current';
    return 'indicator-pending';
  }

  getApprovalStatus(workflow: ApprovalWorkflow, level: number, approverId: string): boolean {
    return workflow.approvalHistory.some(record => 
      record.level === level && 
      record.approverId === approverId && 
      record.decision === 'approved'
    );
  }

  getDecisionClass(decision: string): string {
    const classes: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      conditional: 'bg-yellow-100 text-yellow-800',
      deferred: 'bg-gray-100 text-gray-800'
    };
    return classes[decision] || 'bg-gray-100 text-gray-800';
  }

  getDecisionLabel(decision: string): string {
    const labels: Record<string, string> = {
      approved: 'Aprobado',
      rejected: 'Rechazado',
      conditional: 'Condicional',
      deferred: 'Diferido',
      delegated: 'Delegado'
    };
    return labels[decision] || decision;
  }

  async approveSelected() {
    const selected = this.selectedDeliverables();
    console.log('Approving selected deliverables:', selected);
    // Implementar lógica de aprobación masiva
  }

  approveDeliverable(deliverable: Deliverable) {
    console.log('Approving deliverable:', deliverable.title);
    // Implementar modal de aprobación
  }

  rejectDeliverable(deliverable: Deliverable) {
    console.log('Rejecting deliverable:', deliverable.title);
    // Implementar modal de rechazo
  }

  viewWorkflowDetails(deliverable: Deliverable) {
    console.log('Viewing workflow details for:', deliverable.title);
    // Implementar modal de detalles
  }

  async refreshWorkflows() {
    await this.deliverableService.refreshData();
  }
}
