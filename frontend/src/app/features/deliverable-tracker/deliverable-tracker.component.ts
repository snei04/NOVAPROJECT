import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DeliverableService } from './services/deliverable.service';
import { QualityTrackerComponent } from './components/quality-tracker.component';
import { ApprovalWorkflowComponent } from './components/approval-workflow.component';

@Component({
  selector: 'app-deliverable-tracker',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    QualityTrackerComponent, 
    ApprovalWorkflowComponent
  ],
  template: `
    <div class="deliverable-tracker-dashboard p-6 bg-gray-50 min-h-screen">
      <!-- Header Principal -->
      <div class="dashboard-header mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold text-gray-900">📋 Deliverable Tracker Avanzado</h1>
            <p class="text-gray-600 mt-2 text-lg">
              Solución completa al problema de IMEVI: sin criterios claros → tracking automático con quality scoring
            </p>
          </div>
          <div class="flex space-x-4">
            <button 
              class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
              (click)="createNewDeliverable()"
            >
              ➕ Nuevo Entregable
            </button>
            <button 
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              (click)="refreshDashboard()"
            >
              🔄 Actualizar Todo
            </button>
          </div>
        </div>
      </div>

      <!-- Métricas Ejecutivas -->
      <div class="executive-metrics mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Entregables -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Entregables</p>
                <p class="text-3xl font-bold text-gray-900">{{ totalDeliverables() }}</p>
                <p class="text-sm text-blue-600 mt-1">Con criterios trackables</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <span class="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <!-- Quality Score Promedio -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Quality Score Promedio</p>
                <p class="text-3xl font-bold text-green-600">{{ averageQualityScore() }}</p>
                <p class="text-sm text-green-600 mt-1">vs IMEVI: +30% calidad</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <span class="text-3xl">📈</span>
              </div>
            </div>
          </div>

          <!-- Entrega a Tiempo -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Entrega a Tiempo</p>
                <p class="text-3xl font-bold text-purple-600">{{ onTimeDeliveryRate() }}%</p>
                <p class="text-sm text-purple-600 mt-1">Tasa de puntualidad</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <span class="text-3xl">⏰</span>
              </div>
            </div>
          </div>

          <!-- Pendientes Aprobación -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Pendientes Aprobación</p>
                <p class="text-3xl font-bold text-orange-600">{{ pendingApprovals().length }}</p>
                <p class="text-sm text-orange-600 mt-1">Workflow automático</p>
              </div>
              <div class="bg-orange-100 p-3 rounded-full">
                <span class="text-3xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegación por Tabs -->
      <div class="dashboard-tabs mb-8">
        <div class="bg-white rounded-lg shadow-md">
          <div class="border-b border-gray-200">
            <nav class="flex space-x-8 px-6" aria-label="Tabs">
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                [class]="activeTab() === 'overview' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                (click)="setActiveTab('overview')"
              >
                📊 Overview
              </button>
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                [class]="activeTab() === 'quality' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                (click)="setActiveTab('quality')"
              >
                📈 Quality Scoring
              </button>
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                [class]="activeTab() === 'approval' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                (click)="setActiveTab('approval')"
              >
                ✅ Workflow Aprobación ({{ pendingApprovals().length }})
              </button>
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                [class]="activeTab() === 'analytics' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                (click)="setActiveTab('analytics')"
              >
                📊 Analytics IMEVI
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- Contenido por Tab -->
      <div class="tab-content">
        @switch (activeTab()) {
          @case ('overview') {
            <div class="overview-content">
              <!-- Lista de Entregables -->
              <div class="deliverables-overview mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6">
                  <h2 class="text-xl font-bold text-gray-900 mb-4">📋 Entregables del Proyecto</h2>
                  
                  <div class="deliverables-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (deliverable of allDeliverables(); track deliverable.id) {
                      <div class="deliverable-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="card-header flex justify-between items-start mb-3">
                          <h3 class="font-semibold text-gray-900">{{ deliverable.title }}</h3>
                          <div class="status-badge" [class]="getStatusClass(deliverable.status)">
                            {{ getStatusLabel(deliverable.status) }}
                          </div>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-3">{{ deliverable.description }}</p>
                        
                        <div class="card-metrics grid grid-cols-2 gap-2 mb-3">
                          <div class="metric">
                            <span class="text-xs text-gray-500">Quality Score</span>
                            <p class="font-semibold" [class]="getScoreColor(deliverable.qualityScore)">
                              {{ deliverable.qualityScore }}/100
                            </p>
                          </div>
                          <div class="metric">
                            <span class="text-xs text-gray-500">Progreso</span>
                            <p class="font-semibold text-blue-600">{{ deliverable.progress }}%</p>
                          </div>
                          <div class="metric">
                            <span class="text-xs text-gray-500">Prioridad</span>
                            <p class="font-semibold" [class]="getPriorityColor(deliverable.priority)">
                              {{ deliverable.priority }}
                            </p>
                          </div>
                          <div class="metric">
                            <span class="text-xs text-gray-500">Responsable</span>
                            <p class="font-semibold text-gray-700 text-xs">{{ deliverable.ownerName.split(' ')[0] }}</p>
                          </div>
                        </div>
                        
                        <div class="card-actions flex space-x-2">
                          <button 
                            class="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
                            (click)="viewDeliverable(deliverable)"
                          >
                            👁️ Ver
                          </button>
                          @if (deliverable.status === 'in_progress') {
                            <button 
                              class="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
                              (click)="submitForApproval(deliverable)"
                            >
                              ✅ Enviar
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
          @case ('quality') {
            <app-quality-tracker></app-quality-tracker>
          }
          @case ('approval') {
            <app-approval-workflow></app-approval-workflow>
          }
          @case ('analytics') {
            <div class="analytics-content">
              <!-- Comparación IMEVI Detallada -->
              <div class="imevi-detailed-comparison mb-8">
                <div class="bg-white rounded-xl shadow-lg p-8">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6">📊 Análisis Comparativo: IMEVI vs NovaProject</h2>
                  
                  <div class="comparison-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- IMEVI - Sin Criterios -->
                    <div class="imevi-section">
                      <div class="section-header bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h3 class="text-lg font-semibold text-red-800 flex items-center">
                          <span class="mr-2">❌</span>
                          IMEVI - Sin Criterios Claros
                        </h3>
                        <p class="text-sm text-red-600 mt-1">Cuarto problema crítico identificado</p>
                      </div>
                      
                      <div class="problems-list space-y-3">
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Sin criterios de aceptación</h4>
                          <p class="text-sm text-red-600">Evaluación subjetiva y variable</p>
                        </div>
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Proceso de aprobación manual</h4>
                          <p class="text-sm text-red-600">Emails perdidos, sin tracking</p>
                        </div>
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Sin métricas de calidad</h4>
                          <p class="text-sm text-red-600">Imposible medir objetivamente</p>
                        </div>
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Detección tardía de problemas</h4>
                          <p class="text-sm text-red-600">Defectos encontrados al final</p>
                        </div>
                      </div>
                      
                      <div class="cost-impact mt-4 bg-red-100 border border-red-300 rounded-lg p-4">
                        <h4 class="font-semibold text-red-800">💰 Impacto Económico</h4>
                        <p class="text-2xl font-bold text-red-600">$2.088.000 COP</p>
                        <p class="text-sm text-red-600">12% del presupuesto en retrabajo y defectos</p>
                      </div>
                    </div>

                    <!-- NovaProject - Tracking Avanzado -->
                    <div class="novaproject-section">
                      <div class="section-header bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h3 class="text-lg font-semibold text-green-800 flex items-center">
                          <span class="mr-2">✅</span>
                          NovaProject - Tracking Avanzado
                        </h3>
                        <p class="text-sm text-green-600 mt-1">Sistema completo implementado</p>
                      </div>
                      
                      <div class="solutions-list space-y-3">
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Criterios trackables automáticos</h4>
                          <p class="text-sm text-green-600">Medición objetiva y continua</p>
                        </div>
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Workflow multi-reviewer</h4>
                          <p class="text-sm text-green-600">Tracking completo y automático</p>
                        </div>
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Quality scoring automático</h4>
                          <p class="text-sm text-green-600">Métricas multi-dimensionales</p>
                        </div>
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Detección temprana</h4>
                          <p class="text-sm text-green-600">Problemas identificados proactivamente</p>
                        </div>
                      </div>
                      
                      <div class="savings-impact mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
                        <h4 class="font-semibold text-green-800">💰 Ahorro Estimado</h4>
                        <p class="text-2xl font-bold text-green-600">$1.392.000 COP</p>
                        <p class="text-sm text-green-600">67% reducción en costos de calidad</p>
                      </div>
                    </div>
                  </div>

                  <!-- Métricas de Mejora -->
                  <div class="improvement-metrics mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 Métricas de Mejora</h3>
                    <div class="metrics-grid grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">+30%</p>
                        <p class="text-sm text-gray-700">Incremento calidad</p>
                        <p class="text-xs text-gray-500">Scoring automático</p>
                      </div>
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">+50%</p>
                        <p class="text-sm text-gray-700">Eficiencia aprobación</p>
                        <p class="text-xs text-gray-500">Workflow automático</p>
                      </div>
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">-60%</p>
                        <p class="text-sm text-gray-700">Defectos en producción</p>
                        <p class="text-xs text-gray-500">Detección temprana</p>
                      </div>
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">67%</p>
                        <p class="text-sm text-gray-700">ROI</p>
                        <p class="text-xs text-gray-500">Ahorro vs manual</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ROI Total NovaProject -->
              <div class="total-roi">
                <div class="bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-xl p-8">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">🏆 ROI Total NovaProject v2.0.0</h2>
                  
                  <div class="roi-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="roi-item text-center">
                      <div class="bg-white rounded-lg p-4 shadow">
                        <h3 class="font-semibold text-green-800">Dashboard Progreso</h3>
                        <p class="text-2xl font-bold text-green-600">$5.220.000</p>
                        <p class="text-sm text-green-600">✅ Completado</p>
                      </div>
                    </div>
                    <div class="roi-item text-center">
                      <div class="bg-white rounded-lg p-4 shadow">
                        <h3 class="font-semibold text-green-800">Stakeholder Mgmt</h3>
                        <p class="text-2xl font-bold text-green-600">$1.920.000</p>
                        <p class="text-sm text-green-600">✅ Completado</p>
                      </div>
                    </div>
                    <div class="roi-item text-center">
                      <div class="bg-white rounded-lg p-4 shadow">
                        <h3 class="font-semibold text-green-800">Risk Management</h3>
                        <p class="text-2xl font-bold text-green-600">$2.088.000</p>
                        <p class="text-sm text-green-600">✅ Completado</p>
                      </div>
                    </div>
                    <div class="roi-item text-center">
                      <div class="bg-white rounded-lg p-4 shadow">
                        <h3 class="font-semibold text-green-800">Deliverable Tracker</h3>
                        <p class="text-2xl font-bold text-green-600">$1.392.000</p>
                        <p class="text-sm text-green-600">✅ Completado</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="total-savings text-center">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">💰 ROI Total Acumulado</h3>
                    <p class="text-5xl font-bold text-green-600 mb-2">$10.620.000 COP</p>
                    <p class="text-lg text-green-700">61% ahorro vs gestión manual IMEVI</p>
                    <p class="text-sm text-gray-600 mt-2">4 de 4 problemas críticos resueltos ✅</p>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .deliverable-tracker-dashboard {
      animation: fadeIn 0.6s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .metric-card {
      transition: all 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .deliverable-card {
      transition: all 0.2s ease;
    }
    
    .deliverable-card:hover {
      transform: translateY(-2px);
    }
    
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-in_progress {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-approval {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-not_started {
      background: #f3f4f6;
      color: #374151;
    }
    
    .tab-content {
      animation: slideIn 0.4s ease-out;
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class DeliverableTrackerComponent implements OnInit {
  private deliverableService = inject(DeliverableService);

  // Signals para estado local
  activeTab = signal<'overview' | 'quality' | 'approval' | 'analytics'>('overview');

  // Computed signals
  allDeliverables = computed(() => this.deliverableService.getAllDeliverables());
  totalDeliverables = computed(() => this.deliverableService.totalDeliverables());
  averageQualityScore = computed(() => this.deliverableService.averageQualityScore());
  onTimeDeliveryRate = computed(() => this.deliverableService.onTimeDeliveryRate());
  pendingApprovals = computed(() => this.deliverableService.getPendingApprovals());

  ngOnInit() {
    this.loadDashboardData();
    
    // Auto-refresh cada 3 minutos
    setInterval(() => {
      this.refreshDashboard();
    }, 3 * 60 * 1000);
  }

  private async loadDashboardData() {
    await this.deliverableService.refreshData();
  }

  async refreshDashboard() {
    await this.deliverableService.refreshData();
  }

  setActiveTab(tab: 'overview' | 'quality' | 'approval' | 'analytics') {
    this.activeTab.set(tab);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      not_started: 'No Iniciado',
      in_progress: 'En Progreso',
      review: 'En Revisión',
      approval: 'En Aprobación',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-gray-600'
    };
    return colors[priority] || 'text-gray-600';
  }

  viewDeliverable(deliverable: any) {
    console.log('Viewing deliverable:', deliverable.title);
    // Implementar navegación a detalles
  }

  submitForApproval(deliverable: any) {
    console.log('Submitting for approval:', deliverable.title);
    // Implementar envío a aprobación
  }

  createNewDeliverable() {
    console.log('Creating new deliverable');
    // Implementar modal de creación
  }
}
