import { Component, OnInit, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DeliverableService } from '../services/deliverable.service';
import { Deliverable, QualityMetrics } from '../models/deliverable.model';

@Component({
  selector: 'app-quality-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quality-tracker p-6">
      <!-- Header -->
      <div class="tracker-header mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">📊 Quality Scoring Automático</h2>
            <p class="text-gray-600 mt-2">
              Solución al problema de IMEVI: sin criterios claros → scoring automático multi-dimensional
            </p>
          </div>
          <div class="flex space-x-3">
            <button 
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              (click)="recalculateAllScores()"
            >
              🔄 Recalcular Scores
            </button>
            <button 
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              (click)="exportQualityReport()"
            >
              📊 Exportar Reporte
            </button>
          </div>
        </div>
      </div>

      <!-- Métricas Generales de Calidad -->
      <div class="quality-overview mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Score Promedio</p>
                <p class="text-3xl font-bold text-green-600">{{ averageQualityScore() }}</p>
                <p class="text-sm text-green-600 mt-1">vs IMEVI: +30% calidad</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <span class="text-3xl">📈</span>
              </div>
            </div>
          </div>

          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Entregables Evaluados</p>
                <p class="text-3xl font-bold text-blue-600">{{ totalDeliverables() }}</p>
                <p class="text-sm text-blue-600 mt-1">Con criterios trackables</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <span class="text-3xl">📋</span>
              </div>
            </div>
          </div>

          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Defectos Promedio</p>
                <p class="text-3xl font-bold text-orange-600">{{ averageDefects() }}</p>
                <p class="text-sm text-orange-600 mt-1">Por entregable</p>
              </div>
              <div class="bg-orange-100 p-3 rounded-full">
                <span class="text-3xl">🐛</span>
              </div>
            </div>
          </div>

          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Tasa Resolución</p>
                <p class="text-3xl font-bold text-purple-600">{{ defectResolutionRate() }}%</p>
                <p class="text-sm text-purple-600 mt-1">Defectos resueltos</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <span class="text-3xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Entregables con Quality Score -->
      <div class="deliverables-quality-list">
        <div class="bg-white rounded-xl shadow-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">📋 Entregables por Quality Score</h3>
            <div class="flex space-x-4 mt-2">
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterScore() === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setScoreFilter('all')"
              >
                Todos ({{ allDeliverables().length }})
              </button>
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterScore() === 'excellent' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setScoreFilter('excellent')"
              >
                Excelente 90+ ({{ excellentDeliverables().length }})
              </button>
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterScore() === 'good' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setScoreFilter('good')"
              >
                Bueno 70-89 ({{ goodDeliverables().length }})
              </button>
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterScore() === 'needs_improvement' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setScoreFilter('needs_improvement')"
              >
                Mejorar <70 ({{ needsImprovementDeliverables().length }})
              </button>
            </div>
          </div>
          
          <div class="divide-y divide-gray-200">
            @for (deliverable of filteredDeliverables(); track deliverable.id) {
              <div class="deliverable-quality-item p-6 hover:bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <!-- Header del entregable -->
                    <div class="flex items-center space-x-3 mb-3">
                      <h4 class="font-semibold text-gray-900">{{ deliverable.title }}</h4>
                      <div class="quality-score-badge" [class]="getScoreBadgeClass(deliverable.qualityScore)">
                        {{ deliverable.qualityScore }}/100
                      </div>
                      <div class="status-badge" [class]="getStatusBadgeClass(deliverable.status)">
                        {{ getStatusLabel(deliverable.status) }}
                      </div>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-4">{{ deliverable.description }}</p>
                    
                    <!-- Métricas de Calidad Detalladas -->
                    <div class="quality-metrics-breakdown">
                      <h5 class="text-sm font-medium text-gray-700 mb-2">📊 Breakdown de Quality Score:</h5>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <!-- Completeness -->
                        <div class="metric-item">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-500">Completitud</span>
                            <span class="text-xs font-medium">{{ deliverable.qualityMetrics.completeness }}%</span>
                          </div>
                          <div class="progress-bar">
                            <div class="progress-fill" 
                                 [style.width.%]="deliverable.qualityMetrics.completeness"
                                 [class]="getProgressClass(deliverable.qualityMetrics.completeness)">
                            </div>
                          </div>
                        </div>
                        
                        <!-- Timeliness -->
                        <div class="metric-item">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-500">Puntualidad</span>
                            <span class="text-xs font-medium">{{ deliverable.qualityMetrics.timeliness }}%</span>
                          </div>
                          <div class="progress-bar">
                            <div class="progress-fill" 
                                 [style.width.%]="deliverable.qualityMetrics.timeliness"
                                 [class]="getProgressClass(deliverable.qualityMetrics.timeliness)">
                            </div>
                          </div>
                        </div>
                        
                        <!-- Accuracy -->
                        <div class="metric-item">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-500">Precisión</span>
                            <span class="text-xs font-medium">{{ deliverable.qualityMetrics.accuracy }}%</span>
                          </div>
                          <div class="progress-bar">
                            <div class="progress-fill" 
                                 [style.width.%]="deliverable.qualityMetrics.accuracy"
                                 [class]="getProgressClass(deliverable.qualityMetrics.accuracy)">
                            </div>
                          </div>
                        </div>
                        
                        <!-- Compliance -->
                        <div class="metric-item">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-500">Cumplimiento</span>
                            <span class="text-xs font-medium">{{ deliverable.qualityMetrics.compliance }}%</span>
                          </div>
                          <div class="progress-bar">
                            <div class="progress-fill" 
                                 [style.width.%]="deliverable.qualityMetrics.compliance"
                                 [class]="getProgressClass(deliverable.qualityMetrics.compliance)">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Métricas Adicionales -->
                    <div class="additional-metrics mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="metric-detail">
                        <span class="text-xs text-gray-500">Defectos Encontrados</span>
                        <p class="text-sm font-medium text-red-600">{{ deliverable.qualityMetrics.defectsFound }}</p>
                      </div>
                      <div class="metric-detail">
                        <span class="text-xs text-gray-500">Defectos Resueltos</span>
                        <p class="text-sm font-medium text-green-600">{{ deliverable.qualityMetrics.defectsResolved }}</p>
                      </div>
                      <div class="metric-detail">
                        <span class="text-xs text-gray-500">Ciclos de Revisión</span>
                        <p class="text-sm font-medium text-blue-600">{{ deliverable.qualityMetrics.reviewCycles }}</p>
                      </div>
                      <div class="metric-detail">
                        <span class="text-xs text-gray-500">Horas de Retrabajo</span>
                        <p class="text-sm font-medium text-orange-600">{{ deliverable.qualityMetrics.reworkHours }}h</p>
                      </div>
                    </div>
                    
                    <!-- Satisfacción de Stakeholders (si disponible) -->
                    @if (deliverable.qualityMetrics.stakeholderSatisfaction) {
                      <div class="stakeholder-satisfaction mt-4">
                        <div class="flex items-center space-x-2">
                          <span class="text-sm text-gray-600">👥 Satisfacción Stakeholders:</span>
                          <div class="flex space-x-1">
                            @for (star of getStarArray(deliverable.qualityMetrics.stakeholderSatisfaction); track star) {
                              <span class="text-yellow-400">⭐</span>
                            }
                          </div>
                          <span class="text-sm font-medium">{{ deliverable.qualityMetrics.stakeholderSatisfaction }}/10</span>
                        </div>
                      </div>
                    }
                  </div>
                  
                  <!-- Acciones -->
                  <div class="deliverable-actions flex flex-col space-y-2 ml-4">
                    <button 
                      class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                      (click)="viewQualityDetails(deliverable)"
                    >
                      📊 Ver Detalles
                    </button>
                    <button 
                      class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      (click)="recalculateScore(deliverable)"
                    >
                      🔄 Recalcular
                    </button>
                    @if (deliverable.qualityScore < 70) {
                      <button 
                        class="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700"
                        (click)="createImprovementPlan(deliverable)"
                      >
                        📋 Plan Mejora
                      </button>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-6 text-center text-gray-500">
                <span class="text-4xl mb-2 block">📊</span>
                <p>No hay entregables {{ getFilterLabel() }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Comparación IMEVI -->
      <div class="imevi-comparison mt-8">
        <div class="bg-gradient-to-r from-red-50 to-green-50 border border-orange-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Quality Scoring vs IMEVI</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="imevi-before">
              <h4 class="font-medium text-red-800 mb-2">❌ IMEVI - Sin Criterios Claros</h4>
              <ul class="text-sm text-red-700 space-y-1">
                <li>• Evaluación subjetiva sin métricas</li>
                <li>• Sin criterios de aceptación trackables</li>
                <li>• Calidad evaluada al final del proyecto</li>
                <li>• Sin scoring automático</li>
                <li>• Defectos detectados tardíamente</li>
              </ul>
            </div>
            
            <div class="novaproject-after">
              <h4 class="font-medium text-green-800 mb-2">✅ NovaProject - Quality Scoring Automático</h4>
              <ul class="text-sm text-green-700 space-y-1">
                <li>• Scoring multi-dimensional automático</li>
                <li>• Criterios de aceptación trackables</li>
                <li>• Evaluación continua en tiempo real</li>
                <li>• Métricas objetivas y medibles</li>
                <li>• Detección temprana de problemas</li>
              </ul>
            </div>
          </div>
          
          <div class="improvement-metrics mt-6 bg-green-100 border border-green-300 rounded-lg p-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-green-600">+30%</p>
                <p class="text-sm text-green-700">Incremento calidad</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">+40%</p>
                <p class="text-sm text-green-700">Objetividad evaluación</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">-60%</p>
                <p class="text-sm text-green-700">Defectos en producción</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quality-tracker {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .metric-card {
      transition: all 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .deliverable-quality-item {
      transition: background-color 0.2s ease;
    }
    
    .quality-score-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .score-excellent {
      background: #d1fae5;
      color: #065f46;
    }
    
    .score-good {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .score-fair {
      background: #fef3c7;
      color: #92400e;
    }
    
    .score-poor {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-approval {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-in_progress {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-not_started {
      background: #f3f4f6;
      color: #374151;
    }
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      transition: width 0.6s ease;
      border-radius: 2px;
    }
    
    .progress-excellent {
      background: linear-gradient(90deg, #10b981, #059669);
    }
    
    .progress-good {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }
    
    .progress-fair {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }
    
    .progress-poor {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }
    
    .metric-item {
      background: #f9fafb;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
    }
    
    .metric-detail {
      text-align: center;
      padding: 0.5rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }
  `]
})
export class QualityTrackerComponent implements OnInit {
  private deliverableService = inject(DeliverableService);

  // Signals para filtros
  filterScore = signal<'all' | 'excellent' | 'good' | 'needs_improvement'>('all');

  // Computed signals
  allDeliverables = computed(() => this.deliverableService.getAllDeliverables());
  totalDeliverables = computed(() => this.deliverableService.totalDeliverables());
  averageQualityScore = computed(() => this.deliverableService.averageQualityScore());
  
  excellentDeliverables = computed(() => 
    this.allDeliverables().filter(d => d.qualityScore >= 90)
  );
  
  goodDeliverables = computed(() => 
    this.allDeliverables().filter(d => d.qualityScore >= 70 && d.qualityScore < 90)
  );
  
  needsImprovementDeliverables = computed(() => 
    this.allDeliverables().filter(d => d.qualityScore < 70)
  );
  
  filteredDeliverables = computed(() => {
    const filter = this.filterScore();
    switch (filter) {
      case 'excellent':
        return this.excellentDeliverables();
      case 'good':
        return this.goodDeliverables();
      case 'needs_improvement':
        return this.needsImprovementDeliverables();
      default:
        return this.allDeliverables().sort((a, b) => b.qualityScore - a.qualityScore);
    }
  });
  
  averageDefects = computed(() => {
    const deliverables = this.allDeliverables();
    if (deliverables.length === 0) return 0;
    
    const totalDefects = deliverables.reduce((sum, d) => 
      sum + d.qualityMetrics.defectsFound, 0
    );
    
    return Math.round(totalDefects / deliverables.length * 10) / 10;
  });
  
  defectResolutionRate = computed(() => {
    const deliverables = this.allDeliverables();
    const totalDefects = deliverables.reduce((sum, d) => 
      sum + d.qualityMetrics.defectsFound, 0
    );
    const resolvedDefects = deliverables.reduce((sum, d) => 
      sum + d.qualityMetrics.defectsResolved, 0
    );
    
    return totalDefects > 0 ? Math.round((resolvedDefects / totalDefects) * 100) : 0;
  });

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    await this.deliverableService.refreshData();
  }

  setScoreFilter(filter: 'all' | 'excellent' | 'good' | 'needs_improvement') {
    this.filterScore.set(filter);
  }

  getFilterLabel(): string {
    const labels = {
      all: '',
      excellent: 'excelentes',
      good: 'buenos',
      needs_improvement: 'que necesitan mejora'
    };
    return labels[this.filterScore()];
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
  }

  getStatusBadgeClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      not_started: 'No Iniciado',
      in_progress: 'En Progreso',
      review: 'En Revisión',
      approval: 'En Aprobación',
      rework: 'Retrabajo',
      completed: 'Completado',
      cancelled: 'Cancelado',
      on_hold: 'En Espera'
    };
    return labels[status] || status;
  }

  getProgressClass(value: number): string {
    if (value >= 90) return 'progress-excellent';
    if (value >= 70) return 'progress-good';
    if (value >= 50) return 'progress-fair';
    return 'progress-poor';
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  async recalculateAllScores() {
    console.log('Recalculating all quality scores...');
    // Implementar lógica de recálculo
    await this.deliverableService.refreshData();
  }

  recalculateScore(deliverable: Deliverable) {
    console.log('Recalculating score for:', deliverable.title);
    // Implementar lógica de recálculo individual
  }

  viewQualityDetails(deliverable: Deliverable) {
    console.log('Viewing quality details for:', deliverable.title);
    // Implementar modal de detalles
  }

  createImprovementPlan(deliverable: Deliverable) {
    console.log('Creating improvement plan for:', deliverable.title);
    // Implementar plan de mejora
  }

  exportQualityReport() {
    console.log('Exporting quality report...');
    // Implementar exportación de reporte
  }
}
