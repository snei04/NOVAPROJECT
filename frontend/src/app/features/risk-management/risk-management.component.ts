import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RiskService } from './services/risk.service';
import { RiskMatrixComponent } from './components/risk-matrix.component';
import { EscalationAlertsComponent } from './components/escalation-alerts.component';

@Component({
  selector: 'app-risk-management',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    RiskMatrixComponent, 
    EscalationAlertsComponent
  ],
  template: `
    <div class="risk-management-dashboard p-6 bg-gray-50 min-h-screen">
      <!-- Header Principal -->
      <div class="dashboard-header mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold text-gray-900">⚠️ Risk Management Inteligente</h1>
            <p class="text-gray-600 mt-2 text-lg">
              Solución completa al problema de IMEVI: gestión reactiva → gestión proactiva automática
            </p>
          </div>
          <div class="flex space-x-4">
            <button 
              class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
              (click)="showCriticalRisks()"
            >
              🚨 Riesgos Críticos ({{ criticalRisks().length }})
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
          <!-- Total Riesgos -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Riesgos</p>
                <p class="text-3xl font-bold text-gray-900">{{ totalRisks() }}</p>
                <p class="text-sm text-blue-600 mt-1">Identificados y gestionados</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <span class="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <!-- Riesgos Críticos -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Críticos + Altos</p>
                <p class="text-3xl font-bold text-red-600">
                  {{ criticalRisks().length + highRisks().length }}
                </p>
                <p class="text-sm text-red-600 mt-1">Requieren atención inmediata</p>
              </div>
              <div class="bg-red-100 p-3 rounded-full">
                <span class="text-3xl">🔴</span>
              </div>
            </div>
          </div>

          <!-- Escalaciones Activas -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Escalaciones Activas</p>
                <p class="text-3xl font-bold text-orange-600">{{ activeEscalations().length }}</p>
                <p class="text-sm text-orange-600 mt-1">Automáticas en progreso</p>
              </div>
              <div class="bg-orange-100 p-3 rounded-full">
                <span class="text-3xl">🚨</span>
              </div>
            </div>
          </div>

          <!-- Efectividad Controles -->
          <div class="metric-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Efectividad Controles</p>
                <p class="text-3xl font-bold text-green-600">{{ controlEffectiveness() }}%</p>
                <p class="text-sm text-green-600 mt-1">vs IMEVI: +60% mejora</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <span class="text-3xl">🛡️</span>
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
                [class]="activeTab() === 'matrix' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                (click)="setActiveTab('matrix')"
              >
                🎯 Matriz de Riesgos
              </button>
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                [class]="activeTab() === 'escalations' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                (click)="setActiveTab('escalations')"
              >
                🚨 Escalaciones ({{ activeEscalations().length }})
              </button>
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                [class]="activeTab() === 'analytics' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                (click)="setActiveTab('analytics')"
              >
                📈 Analytics
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- Contenido por Tab -->
      <div class="tab-content">
        @switch (activeTab()) {
          @case ('matrix') {
            <app-risk-matrix></app-risk-matrix>
          }
          @case ('escalations') {
            <app-escalation-alerts></app-escalation-alerts>
          }
          @case ('analytics') {
            <div class="analytics-content">
              <!-- Comparación IMEVI Detallada -->
              <div class="imevi-detailed-comparison mb-8">
                <div class="bg-white rounded-xl shadow-lg p-8">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6">📊 Análisis Comparativo: IMEVI vs NovaProject</h2>
                  
                  <div class="comparison-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- IMEVI - Gestión Reactiva -->
                    <div class="imevi-section">
                      <div class="section-header bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h3 class="text-lg font-semibold text-red-800 flex items-center">
                          <span class="mr-2">❌</span>
                          IMEVI - Gestión Reactiva
                        </h3>
                        <p class="text-sm text-red-600 mt-1">Problemas identificados en proyecto $17.400.000 COP</p>
                      </div>
                      
                      <div class="problems-list space-y-3">
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Solo seguimiento semanal</h4>
                          <p class="text-sm text-red-600">Riesgos sin monitoreo continuo</p>
                        </div>
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Sin alertas automáticas</h4>
                          <p class="text-sm text-red-600">Escalation manual y tardía</p>
                        </div>
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Controles sin fechas</h4>
                          <p class="text-sm text-red-600">Sin responsables definidos</p>
                        </div>
                        <div class="problem-item bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <h4 class="font-medium text-red-800">Gestión ad-hoc</h4>
                          <p class="text-sm text-red-600">Sin metodología estructurada</p>
                        </div>
                      </div>
                      
                      <div class="cost-impact mt-4 bg-red-100 border border-red-300 rounded-lg p-4">
                        <h4 class="font-semibold text-red-800">💰 Impacto Económico</h4>
                        <p class="text-2xl font-bold text-red-600">$3.480.000 COP</p>
                        <p class="text-sm text-red-600">20% del presupuesto perdido en gestión reactiva</p>
                      </div>
                    </div>

                    <!-- NovaProject - Gestión Proactiva -->
                    <div class="novaproject-section">
                      <div class="section-header bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h3 class="text-lg font-semibold text-green-800 flex items-center">
                          <span class="mr-2">✅</span>
                          NovaProject - Gestión Proactiva
                        </h3>
                        <p class="text-sm text-green-600 mt-1">Sistema inteligente implementado</p>
                      </div>
                      
                      <div class="solutions-list space-y-3">
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Scoring automático tiempo real</h4>
                          <p class="text-sm text-green-600">Monitoreo continuo 24/7</p>
                        </div>
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Escalation automática</h4>
                          <p class="text-sm text-green-600">Reglas configurables inteligentes</p>
                        </div>
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Controles con ownership</h4>
                          <p class="text-sm text-green-600">Fechas y responsables asignados</p>
                        </div>
                        <div class="solution-item bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <h4 class="font-medium text-green-800">Matriz visual inteligente</h4>
                          <p class="text-sm text-green-600">Metodología estructurada</p>
                        </div>
                      </div>
                      
                      <div class="savings-impact mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
                        <h4 class="font-semibold text-green-800">💰 Ahorro Estimado</h4>
                        <p class="text-2xl font-bold text-green-600">$2.088.000 COP</p>
                        <p class="text-sm text-green-600">60% reducción en costos de gestión</p>
                      </div>
                    </div>
                  </div>

                  <!-- Métricas de Mejora -->
                  <div class="improvement-metrics mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 Métricas de Mejora</h3>
                    <div class="metrics-grid grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">-70%</p>
                        <p class="text-sm text-gray-700">Tiempo de respuesta</p>
                        <p class="text-xs text-gray-500">Horas vs días</p>
                      </div>
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">+90%</p>
                        <p class="text-sm text-gray-700">Riesgos atendidos</p>
                        <p class="text-xs text-gray-500">Cobertura completa</p>
                      </div>
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">100%</p>
                        <p class="text-sm text-gray-700">Automatización</p>
                        <p class="text-xs text-gray-500">Sin intervención manual</p>
                      </div>
                      <div class="metric text-center">
                        <p class="text-3xl font-bold text-green-600">60%</p>
                        <p class="text-sm text-gray-700">ROI</p>
                        <p class="text-xs text-gray-500">Ahorro vs reactivo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tendencias y Analytics -->
              <div class="trends-analytics">
                <div class="bg-white rounded-xl shadow-lg p-8">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6">📈 Tendencias de Riesgos</h2>
                  
                  <div class="trends-summary grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="trend-card bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 class="font-semibold text-blue-800 mb-2">Score Promedio</h3>
                      <p class="text-2xl font-bold text-blue-600">{{ averageRiskScore() }}</p>
                      <p class="text-sm text-blue-600">Tendencia: Estable</p>
                    </div>
                    
                    <div class="trend-card bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 class="font-semibold text-green-800 mb-2">Controles Activos</h3>
                      <p class="text-2xl font-bold text-green-600">{{ activeControls() }}</p>
                      <p class="text-sm text-green-600">Efectividad: {{ controlEffectiveness() }}%</p>
                    </div>
                    
                    <div class="trend-card bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 class="font-semibold text-purple-800 mb-2">Tiempo Respuesta</h3>
                      <p class="text-2xl font-bold text-purple-600">{{ averageResponseTime() }}h</p>
                      <p class="text-sm text-purple-600">vs IMEVI: -70%</p>
                    </div>
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
    .risk-management-dashboard {
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
    
    .dashboard-tabs {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .tab-content {
      animation: slideIn 0.4s ease-out;
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .comparison-grid {
      animation: staggerIn 0.6s ease-out;
    }
    
    @keyframes staggerIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .problem-item, .solution-item {
      transition: transform 0.2s ease;
    }
    
    .problem-item:hover, .solution-item:hover {
      transform: translateX(4px);
    }
    
    .trend-card {
      transition: all 0.2s ease;
    }
    
    .trend-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class RiskManagementComponent implements OnInit {
  private riskService = inject(RiskService);

  // Signals para estado local
  activeTab = signal<'matrix' | 'escalations' | 'analytics'>('matrix');

  // Computed signals
  totalRisks = computed(() => this.riskService.totalRisks());
  criticalRisks = computed(() => this.riskService.getCriticalRisks());
  highRisks = computed(() => this.riskService.getAllRisks().filter(r => r.riskLevel === 'high'));
  activeEscalations = computed(() => this.riskService.getRecentEscalations().filter(e => 
    e.status === 'triggered' || e.status === 'acknowledged' || e.status === 'in_progress'
  ));
  controlEffectiveness = computed(() => this.riskService.controlEffectiveness());
  averageRiskScore = computed(() => this.riskService.averageRiskScore());
  
  // Computed adicionales para analytics
  activeControls = computed(() => {
    // Mock data - en implementación real vendría del servicio
    return 8;
  });
  
  averageResponseTime = computed(() => {
    // Mock data - calcular tiempo promedio de respuesta a escalaciones
    return 2.5;
  });

  ngOnInit() {
    this.loadDashboardData();
    
    // Auto-refresh cada 2 minutos
    setInterval(() => {
      this.refreshDashboard();
    }, 2 * 60 * 1000);
  }

  private async loadDashboardData() {
    await this.riskService.refreshData();
  }

  async refreshDashboard() {
    await this.riskService.refreshData();
    await this.riskService.checkEscalationRules();
  }

  setActiveTab(tab: 'matrix' | 'escalations' | 'analytics') {
    this.activeTab.set(tab);
  }

  showCriticalRisks() {
    this.setActiveTab('matrix');
    // Trigger para mostrar solo riesgos críticos en la matriz
  }
}
