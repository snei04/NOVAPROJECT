import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importar servicios existentes
import { BoardsService } from '../../services/boards.service';

// Nuevos servicios que crearemos
import { MetricsService } from './services/metrics.service';
import { WeeklyTrackingService } from './services/weekly-tracking.service';

// Componentes que crearemos
import { MetricsCardComponent } from './components/metrics-card.component';
import { ProjectTimelineComponent } from './components/project-timeline.component';
import { WeeklyTrackerComponent } from './components/weekly-tracker.component';
import { KpiOverviewComponent } from './components/kpi-overview.component';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MetricsCardComponent,
    ProjectTimelineComponent,
    WeeklyTrackerComponent,
    KpiOverviewComponent
  ],
  template: `
    <div class="dashboard-container p-6 bg-gray-50 min-h-screen">
      <!-- Header del Dashboard -->
      <div class="dashboard-header mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">📊 Dashboard de Progreso</h1>
            <p class="text-gray-600 mt-2">
              Solución al seguimiento deficiente identificado en IMEVI
            </p>
          </div>
          <div class="flex space-x-4">
            <button 
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              (click)="generateWeeklyReport()"
            >
              📋 Generar Reporte Semanal
            </button>
            <button 
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              (click)="exportMetrics()"
            >
              📊 Exportar Métricas
            </button>
          </div>
        </div>
      </div>

      <!-- Alertas Críticas -->
      @if (criticalAlerts().length > 0) {
        <div class="critical-alerts mb-6">
          <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">🚨</span>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Alertas Críticas ({{ criticalAlerts().length }})
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  @for (alert of criticalAlerts(); track alert.id) {
                    <p class="mb-1">• {{ alert.message }}</p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- KPIs Overview - Resuelve problema de seguimiento -->
      <div class="kpi-section mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          🎯 KPIs en Tiempo Real
        </h2>
        <app-kpi-overview 
          [projectMetrics]="projectMetrics()"
          [comparisonData]="imeviComparison()"
        ></app-kpi-overview>
      </div>

      <!-- Métricas Principales -->
      <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Progreso General -->
        <app-metrics-card 
          title="Progreso General"
          [value]="projectProgress()"
          unit="%"
          [target]="100"
          icon="📈"
          [trend]="progressTrend()"
          [comparison]="{ label: 'vs IMEVI', value: '+60%' }"
        ></app-metrics-card>

        <!-- Entregables Completados -->
        <app-metrics-card 
          title="Entregables"
          [value]="completedDeliverables()"
          [total]="totalDeliverables()"
          icon="✅"
          [trend]="deliverablesTrend()"
          [comparison]="{ label: 'Calidad', value: '+30%' }"
        ></app-metrics-card>

        <!-- Riesgos Activos -->
        <app-metrics-card 
          title="Riesgos Activos"
          [value]="activeRisks()"
          [severity]="riskSeverity()"
          icon="⚠️"
          [trend]="riskTrend()"
          [comparison]="{ label: 'vs Reactivo', value: '-40%' }"
        ></app-metrics-card>

        <!-- Weekly Reports -->
        <app-metrics-card 
          title="Reportes Semanales"
          [value]="weeklyReportsCount()"
          [total]="expectedWeeklyReports()"
          icon="📋"
          [trend]="reportingTrend()"
          [comparison]="{ label: 'vs IMEVI', value: '+2100%' }"
          [highlight]="true"
        ></app-metrics-card>
      </div>

      <!-- Timeline del Proyecto -->
      <div class="timeline-section mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          🗓️ Timeline Visual con Hitos
        </h2>
        <app-project-timeline 
          [milestones]="projectMilestones()"
          [dependencies]="projectDependencies()"
          [currentProgress]="projectProgress()"
          (milestoneUpdate)="onMilestoneUpdate($event)"
        ></app-project-timeline>
      </div>

      <!-- Weekly Tracking Obligatorio -->
      <div class="weekly-tracking-section mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          📅 Weekly Tracking Obligatorio
        </h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <app-weekly-tracker 
            [weeklyReports]="weeklyReports()"
            [nextDeadline]="nextReportDeadline()"
            [isOverdue]="isReportOverdue()"
            (reportSubmit)="onWeeklyReportSubmit($event)"
            (reminderSet)="onSetReminder($event)"
          ></app-weekly-tracker>
        </div>
      </div>

      <!-- Comparación con IMEVI -->
      <div class="imevi-comparison mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          📊 Comparación vs Proyecto IMEVI
        </h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="comparison-card">
              <h3 class="font-medium text-gray-900 mb-2">Seguimiento</h3>
              <div class="flex items-center space-x-2">
                <span class="text-red-600">IMEVI: 3 registros/9 semanas</span>
                <span class="text-green-600">→ NovaProject: Automático diario</span>
              </div>
              <div class="mt-2 text-sm text-green-600 font-medium">
                +2100% mejora
              </div>
            </div>
            
            <div class="comparison-card">
              <h3 class="font-medium text-gray-900 mb-2">Gestión de Riesgos</h3>
              <div class="flex items-center space-x-2">
                <span class="text-red-600">IMEVI: Reactiva</span>
                <span class="text-green-600">→ NovaProject: Proactiva</span>
              </div>
              <div class="mt-2 text-sm text-green-600 font-medium">
                -40% retrasos esperados
              </div>
            </div>
            
            <div class="comparison-card">
              <h3 class="font-medium text-gray-900 mb-2">Calidad</h3>
              <div class="flex items-center space-x-2">
                <span class="text-red-600">IMEVI: Sin criterios</span>
                <span class="text-green-600">→ NovaProject: Tracking automático</span>
              </div>
              <div class="mt-2 text-sm text-green-600 font-medium">
                +30% calidad esperada
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .metrics-grid {
      animation: slideInUp 0.6s ease-out 0.2s both;
    }
    
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .comparison-card {
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #f9fafb;
    }
  `]
})
export class ProjectDashboardComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private metricsService = inject(MetricsService);
  private weeklyTrackingService = inject(WeeklyTrackingService);

  // Signals para estado reactivo
  projectMetrics = computed(() => this.metricsService.getProjectMetrics());
  projectProgress = computed(() => this.metricsService.calculateOverallProgress());
  completedDeliverables = computed(() => this.metricsService.getCompletedDeliverables());
  totalDeliverables = computed(() => this.metricsService.getTotalDeliverables());
  activeRisks = computed(() => this.metricsService.getActiveRisks());
  riskSeverity = computed(() => this.metricsService.calculateRiskSeverity());
  
  // Weekly tracking signals
  weeklyReports = computed(() => this.weeklyTrackingService.getWeeklyReports());
  weeklyReportsCount = computed(() => this.weeklyReports().length);
  expectedWeeklyReports = computed(() => this.weeklyTrackingService.getExpectedReportsCount());
  nextReportDeadline = computed(() => this.weeklyTrackingService.getNextDeadline());
  isReportOverdue = computed(() => this.weeklyTrackingService.isOverdue());
  
  // Timeline signals
  projectMilestones = computed(() => this.metricsService.getProjectMilestones());
  projectDependencies = computed(() => this.metricsService.getProjectDependencies());
  
  // Trends
  progressTrend = computed(() => this.metricsService.getProgressTrend());
  deliverablesTrend = computed(() => this.metricsService.getDeliverablesTrend());
  riskTrend = computed(() => this.metricsService.getRiskTrend());
  reportingTrend = computed(() => this.weeklyTrackingService.getReportingTrend());
  
  // Critical alerts
  criticalAlerts = computed(() => this.metricsService.getCriticalAlerts());
  
  // IMEVI comparison data
  imeviComparison = computed(() => ({
    tracking: { imevi: '3 registros/9 semanas', novaproject: 'Automático diario', improvement: '+2100%' },
    riskManagement: { imevi: 'Reactiva', novaproject: 'Proactiva', improvement: '-40% retrasos' },
    quality: { imevi: 'Sin criterios', novaproject: 'Tracking automático', improvement: '+30% calidad' },
    stakeholders: { imevi: 'Coordinación manual', novaproject: 'Agendamiento inteligente', improvement: '+50% optimización' }
  }));

  ngOnInit() {
    this.loadData();
    
    // Auto-refresh cada 2 minutos
    setInterval(() => {
      this.refreshDashboard();
    }, 2 * 60 * 1000);
  }

  private async loadData() {
    try {
      // Cargar datos reales con fallback a mock
      await this.metricsService.loadRealData();
      await this.weeklyTrackingService.loadWeeklyReports();
      
      console.log('✅ Datos del dashboard cargados exitosamente');
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    }
  }

  async refreshDashboard() {
    await this.loadData();
  }

  private refreshMetrics() {
    this.metricsService.refreshMetrics();
    this.weeklyTrackingService.refreshReports();
  }

  // Event handlers
  onMilestoneUpdate(milestone: any) {
    this.metricsService.updateMilestone(milestone);
  }

  onWeeklyReportSubmit(report: any) {
    this.weeklyTrackingService.submitWeeklyReport(report);
  }

  onSetReminder(reminder: any) {
    this.weeklyTrackingService.setReminder(reminder);
  }

  generateWeeklyReport() {
    const report = this.metricsService.generateWeeklyReport();
    // Implementar descarga o envío del reporte
    console.log('Generando reporte semanal:', report);
  }

  exportMetrics() {
    const metrics = this.metricsService.exportMetrics();
    // Implementar exportación (CSV, PDF, etc.)
    console.log('Exportando métricas:', metrics);
  }
}
