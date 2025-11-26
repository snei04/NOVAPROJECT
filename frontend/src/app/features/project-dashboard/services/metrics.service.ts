import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataConfigService } from '../../../services/data-config.service';
import { environment } from '@environments/environment';
import { firstValueFrom } from 'rxjs';

// Interfaces para el servicio de métricas
export interface ProjectMetrics {
  id: string;
  projectName: string;
  overallProgress: number;
  completedTasks: number;
  totalTasks: number;
  activeRisks: number;
  criticalRisks: number;
  timeline: {
    startDate: Date;
    endDate: Date;
    currentPhase: string;
    milestonesCompleted: number;
    totalMilestones: number;
    daysRemaining: number;
  };
  team: {
    totalMembers: number;
    activeMembers: number;
    utilization: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  deliverables: {
    completed: number;
    inProgress: number;
    pending: number;
    total: number;
    overdue: number;
  };
  quality: {
    overallScore: number;
    averageScore: number;
    passedReviews: number;
    totalReviews: number;
    testCoverage: number;
    codeQuality: number;
    defectRate: number;
  };
  lastUpdated: Date;
}

export interface CriticalAlert {
  id: string;
  type: 'risk' | 'deadline' | 'quality' | 'stakeholder' | 'schedule' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  timestamp: Date;
  dueDate?: Date;
  assignee?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  owner: string;
  dependencies: string[];
  deliverables: string[];
}

export interface ProjectDependency {
  id: string;
  fromMilestone: string;
  toMilestone: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
  lag: number; // días
}

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private http = inject(HttpClient);
  private dataConfig = inject(DataConfigService);

  // Signals para estado reactivo
  private projectMetricsSignal = signal<ProjectMetrics | null>(null);
  private milestonesSignal = signal<Milestone[]>([]);
  private dependenciesSignal = signal<ProjectDependency[]>([]);
  private criticalAlertsSignal = signal<CriticalAlert[]>([]);

  // Public readonly signals
  public projectMetrics = this.projectMetricsSignal.asReadonly();
  public milestones = this.milestonesSignal.asReadonly();
  public dependencies = this.dependenciesSignal.asReadonly();
  public criticalAlerts = this.criticalAlertsSignal.asReadonly();

  // Computed signals para métricas derivadas
  public overallProgress = computed(() => {
    const metrics = this.projectMetrics();
    return metrics?.overallProgress || 0;
  });

  public completedDeliverables = computed(() => {
    const metrics = this.projectMetrics();
    return metrics?.deliverables.completed || 0;
  });

  public totalDeliverables = computed(() => {
    const metrics = this.projectMetrics();
    return metrics?.deliverables.total || 0;
  });

  public activeRisks = computed(() => {
    const metrics = this.projectMetrics();
    return metrics?.activeRisks || 0;
  });

  public criticalRisksCount = computed(() => {
    const metrics = this.projectMetrics();
    return metrics?.criticalRisks || 0;
  });

  public riskSeverity = computed(() => {
    const critical = this.criticalRisksCount();
    const active = this.activeRisks();
    
    if (critical > 0) return 'critical';
    if (active > 3) return 'high';
    if (active > 1) return 'medium';
    return 'low';
  });

  public projectMilestones = computed(() => this.milestones());
  public projectDependencies = computed(() => this.dependencies());

  // Trends (simulados por ahora, después se calcularán con datos históricos)
  public progressTrend = computed(() => {
    const progress = this.overallProgress();
    // Lógica simplificada para demo
    if (progress > 75) return 'up';
    if (progress > 50) return 'stable';
    return 'down';
  });

  public deliverablesTrend = computed(() => {
    const completed = this.completedDeliverables();
    const total = this.totalDeliverables();
    const ratio = total > 0 ? completed / total : 0;
    
    if (ratio > 0.8) return 'up';
    if (ratio > 0.5) return 'stable';
    return 'down';
  });

  public riskTrend = computed(() => {
    const critical = this.criticalRisksCount();
    if (critical === 0) return 'up'; // Menos riesgos es mejor
    if (critical <= 2) return 'stable';
    return 'down';
  });

  // Métodos para cargar datos
  async loadProjectMetrics(): Promise<void> {
    try {
      // Por ahora usamos datos mock, después se conectará a la API real
      const mockMetrics: ProjectMetrics = {
        id: 'nova-project-v2',
        projectName: 'NovaProject v2.0.0',
        overallProgress: 25, // 25% completado
        completedTasks: 12,
        totalTasks: 48,
        activeRisks: 3,
        criticalRisks: 1,
        deliverables: {
          completed: 2,
          inProgress: 3,
          pending: 3,
          total: 8,
          overdue: 0
        },
        timeline: {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-05-15'),
          currentPhase: 'FASE 1: Core Improvements',
          milestonesCompleted: 1,
          totalMilestones: 4,
          daysRemaining: 45
        },
        team: {
          totalMembers: 8,
          activeMembers: 7,
          utilization: 85
        },
        budget: {
          allocated: 25000000,
          spent: 15000000,
          remaining: 10000000
        },
        quality: {
          overallScore: 87,
          averageScore: 85,
          passedReviews: 5,
          totalReviews: 6,
          testCoverage: 92,
          codeQuality: 85,
          defectRate: 0.02
        },
        lastUpdated: new Date()
      };

      // Simular llamada a API
      // const metrics = await firstValueFrom(
      //   this.http.get<ProjectMetrics>('/api/projects/nova-v2/metrics')
      // );
      
      this.projectMetricsSignal.set(mockMetrics);
      
      // Cargar datos relacionados
      await this.loadMilestones();
      await this.loadDependencies();
      await this.loadCriticalAlerts();
      
    } catch (error) {
      console.error('Error loading project metrics:', error);
      throw error;
    }
  }

  private async loadMilestones(): Promise<void> {
    const mockMilestones: Milestone[] = [
      {
        id: 'milestone-1',
        title: 'Dashboard de Progreso',
        description: 'Implementar dashboard con métricas automáticas',
        targetDate: new Date('2024-02-15'),
        status: 'in_progress',
        progress: 60,
        owner: 'Tech Lead',
        dependencies: [],
        deliverables: ['dashboard-component', 'metrics-service', 'kpi-cards']
      },
      {
        id: 'milestone-2',
        title: 'Sistema de Stakeholders',
        description: 'Calendario integrado y agendamiento automático',
        targetDate: new Date('2024-03-15'),
        status: 'pending',
        progress: 0,
        owner: 'Business Analyst',
        dependencies: ['milestone-1'],
        deliverables: ['stakeholder-calendar', 'scheduling-service']
      },
      {
        id: 'milestone-3',
        title: 'Risk Management Inteligente',
        description: 'Matriz visual con escalation automática',
        targetDate: new Date('2024-04-01'),
        status: 'pending',
        progress: 0,
        owner: 'Risk Manager',
        dependencies: ['milestone-2'],
        deliverables: ['risk-matrix', 'escalation-system']
      },
      {
        id: 'milestone-4',
        title: 'Deliverable Tracker',
        description: 'Workflow de aprobación y quality scoring',
        targetDate: new Date('2024-04-15'),
        status: 'pending',
        progress: 0,
        owner: 'Quality Manager',
        dependencies: ['milestone-3'],
        deliverables: ['approval-workflow', 'quality-tracker']
      }
    ];

    this.milestonesSignal.set(mockMilestones);
  }

  private async loadDependencies(): Promise<void> {
    const mockDependencies: ProjectDependency[] = [
      {
        id: 'dep-1',
        fromMilestone: 'milestone-1',
        toMilestone: 'milestone-2',
        type: 'finish_to_start',
        lag: 0
      },
      {
        id: 'dep-2',
        fromMilestone: 'milestone-2',
        toMilestone: 'milestone-3',
        type: 'finish_to_start',
        lag: 3
      },
      {
        id: 'dep-3',
        fromMilestone: 'milestone-3',
        toMilestone: 'milestone-4',
        type: 'finish_to_start',
        lag: 0
      }
    ];

    this.dependenciesSignal.set(mockDependencies);
  }

  private async loadCriticalAlerts(): Promise<void> {
    const mockAlerts: CriticalAlert[] = [
      {
        id: 'alert-1',
        type: 'deadline',
        severity: 'high',
        title: 'Deadline Crítico Dashboard',
        message: 'Dashboard de Progreso debe completarse en 5 días',
        actionRequired: true,
        timestamp: new Date(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assignee: 'Equipo Frontend'
      }
    ];

    this.criticalAlertsSignal.set(mockAlerts);
  }

  // Métodos para actualizar datos
  async refreshMetrics(): Promise<void> {
    await this.loadProjectMetrics();
  }

  updateMilestone(milestone: Partial<Milestone> & { id: string }): void {
    this.milestonesSignal.update(current =>
      current.map(m => m.id === milestone.id ? { ...m, ...milestone } : m)
    );
  }

  // Métodos para generar reportes
  generateWeeklyReport(): any {
    const metrics = this.projectMetrics();
    const milestones = this.milestones();
    const alerts = this.criticalAlerts();

    return {
      reportDate: new Date(),
      projectName: metrics?.projectName,
      overallProgress: metrics?.overallProgress,
      completedThisWeek: this.calculateWeeklyProgress(),
      upcomingMilestones: milestones.filter(m => 
        m.status === 'pending' && 
        new Date(m.targetDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
      criticalAlerts: alerts,
      recommendations: this.generateRecommendations()
    };
  }

  exportMetrics(): any {
    return {
      exportDate: new Date(),
      projectMetrics: this.projectMetrics(),
      milestones: this.milestones(),
      dependencies: this.dependencies(),
      alerts: this.criticalAlerts(),
      trends: {
        progress: this.progressTrend(),
        deliverables: this.deliverablesTrend(),
        risks: this.riskTrend()
      }
    };
  }

  // Métodos auxiliares
  private calculateWeeklyProgress(): number {
    // Lógica para calcular progreso semanal
    // Por ahora retornamos un valor mock
    return 8; // 8% de progreso esta semana
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const progress = this.overallProgress();
    const criticalRisks = this.criticalRisksCount();

    if (progress < 25) {
      recommendations.push('Considerar acelerar el desarrollo del dashboard');
    }

    if (criticalRisks > 0) {
      recommendations.push('Revisar y mitigar riesgos críticos inmediatamente');
    }

    const overdueMilestones = this.milestones().filter(m => 
      m.status !== 'completed' && new Date(m.targetDate) < new Date()
    );

    if (overdueMilestones.length > 0) {
      recommendations.push(`Atender ${overdueMilestones.length} hito(s) vencido(s)`);
    }

    return recommendations;
  }

  // Getters para compatibilidad con el componente
  getProjectMetrics() {
    return this.projectMetrics();
  }

  calculateOverallProgress() {
    return this.overallProgress();
  }

  getCompletedDeliverables() {
    return this.completedDeliverables();
  }

  getTotalDeliverables() {
    return this.totalDeliverables();
  }

  getActiveRisks() {
    return this.activeRisks();
  }

  calculateRiskSeverity() {
    return this.riskSeverity();
  }

  getProjectMilestones() {
    return this.projectMilestones();
  }

  getProjectDependencies() {
    return this.projectDependencies();
  }

  getProgressTrend() {
    return this.progressTrend();
  }

  getDeliverablesTrend() {
    return this.deliverablesTrend();
  }

  getRiskTrend() {
    return this.riskTrend();
  }

  getCriticalAlerts() {
    return this.criticalAlerts();
  }

  // Método para cargar datos reales con fallback a mock
  async loadRealData(): Promise<void> {
    try {
      console.log('📡 Cargando métricas reales desde backend...');
      const projectId = 1; // Usamos ID 1 por defecto para tu proyecto

      // 1. Cargar métricas calculadas
      this.http.get<any>(`${environment.API_URL}/api/milestones/metrics/${projectId}`)
        .subscribe({
          next: (response) => {
            if (response.success) {
              const data = response.data;
              
              // Mapear respuesta del backend a la interfaz ProjectMetrics
              const metrics: ProjectMetrics = {
                ...this.getMockMetrics(), // Usar base mock para datos no implementados aún
                overallProgress: data.progress.current,
                timeline: {
                  ...this.getMockMetrics().timeline,
                  milestonesCompleted: data.milestones.completed,
                  totalMilestones: data.milestones.total
                }
              };
              
              this.projectMetricsSignal.set(metrics);
              console.log('✅ Métricas cargadas:', metrics);
            }
          },
          error: (err) => console.error('Error loading metrics:', err)
        });

      // 2. Cargar milestones reales
      this.http.get<any>(`${environment.API_URL}/api/milestones/project/${projectId}`)
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Mapear milestones del backend a la interfaz Milestone del frontend
              const realMilestones: Milestone[] = response.data.map((m: any) => ({
                id: m.id,
                title: m.title,
                description: m.description || '',
                targetDate: new Date(m.targetDate),
                status: m.status === 'in_progress' ? 'in_progress' : 
                        m.status === 'completed' ? 'completed' : 'pending',
                progress: m.progressPercentage,
                owner: 'System', // Placeholder
                dependencies: [],
                deliverables: []
              }));

              this.milestonesSignal.set(realMilestones);
              console.log('✅ Milestones cargados:', realMilestones);
              
              // Generar alertas basadas en datos reales
              this.generateCriticalAlerts();
            }
          },
          error: (err) => console.error('Error loading milestones:', err)
        });

      // Cargar dependencias (por ahora mock, pendiente endpoint)
      this.dependenciesSignal.set(this.getMockDependencies());

    } catch (error) {
      console.error('Error loading real data, using mock data:', error);
      this.loadMockData();
    }
  }

  // Método para cargar datos mock (fallback)
  private loadMockData(): void {
    this.projectMetricsSignal.set(this.getMockMetrics());
    this.milestonesSignal.set(this.getMockMilestones());
    this.dependenciesSignal.set(this.getMockDependencies());
    this.generateCriticalAlerts();
  }

  // Generar alertas críticas basadas en métricas actuales
  private generateCriticalAlerts(): void {
    const alerts: CriticalAlert[] = [];
    const metrics = this.projectMetrics();

    if (!metrics) return;

    // Alerta por riesgos críticos
    if (metrics.criticalRisks > 0) {
      alerts.push({
        id: 'critical-risks',
        type: 'risk',
        severity: 'critical',
        title: 'Riesgos Críticos Detectados',
        message: `${metrics.criticalRisks} riesgos críticos requieren atención inmediata`,
        timestamp: new Date(),
        actionRequired: true
      });
    }

    // Alerta por retrasos en milestones
    const overdueMilestones = this.milestones().filter(m => 
      m.status === 'overdue' || (m.targetDate < new Date() && m.status !== 'completed')
    );

    if (overdueMilestones.length > 0) {
      alerts.push({
        id: 'overdue-milestones',
        type: 'schedule',
        severity: 'high',
        title: 'Milestones Atrasados',
        message: `${overdueMilestones.length} milestones están atrasados`,
        timestamp: new Date(),
        actionRequired: true
      });
    }

    // Alerta por progreso bajo
    if (metrics.overallProgress < 30 && this.getWeeksElapsed() > 4) {
      alerts.push({
        id: 'low-progress',
        type: 'performance',
        severity: 'medium',
        title: 'Progreso Bajo',
        message: `Solo ${metrics.overallProgress}% completado después de ${this.getWeeksElapsed()} semanas`,
        timestamp: new Date(),
        actionRequired: false
      });
    }

    this.criticalAlertsSignal.set(alerts);
  }

  private getWeeksElapsed(): number {
    // Calcular semanas transcurridas desde inicio del proyecto
    const startDate = new Date('2024-01-01'); // Fecha de inicio del proyecto
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  }

  private getMockMetrics(): ProjectMetrics {
    // Retornar datos mock existentes
    return {
      id: 'nova-project-v2',
      projectName: 'NovaProject v2.0.0 - IMEVI Solutions',
      overallProgress: 75,
      completedTasks: 28,
      totalTasks: 45,
      activeRisks: 4,
      criticalRisks: 1,
      budget: {
        allocated: 50000000,
        spent: 32500000,
        remaining: 17500000
      },
      timeline: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
        currentPhase: 'Implementation',
        milestonesCompleted: 4,
        totalMilestones: 5,
        daysRemaining: 45
      },
      team: {
        totalMembers: 8,
        activeMembers: 7,
        utilization: 85
      },
      deliverables: {
        completed: 12,
        inProgress: 8,
        pending: 5,
        total: 25,
        overdue: 0
      },
      quality: {
        overallScore: 87,
        averageScore: 85,
        passedReviews: 23,
        totalReviews: 25,
        testCoverage: 92,
        codeQuality: 85,
        defectRate: 0.02
      },
      lastUpdated: new Date()
    };
  }

  private getMockMilestones(): Milestone[] {
    return [
      {
        id: 'milestone-1',
        title: 'Dashboard de Progreso Completado',
        description: 'Implementación completa del dashboard con métricas automáticas',
        targetDate: new Date('2024-02-15'),
        actualDate: new Date('2024-02-12'),
        status: 'completed',
        progress: 100,
        owner: 'Tech Lead',
        dependencies: [],
        deliverables: ['dashboard-component', 'metrics-service', 'kpi-widgets']
      },
      {
        id: 'milestone-2',
        title: 'Sistema de Stakeholders Operativo',
        description: 'Calendario integrado y auto-scheduler funcionando',
        targetDate: new Date('2024-03-01'),
        actualDate: new Date('2024-02-28'),
        status: 'completed',
        progress: 100,
        owner: 'Business Analyst',
        dependencies: ['milestone-1'],
        deliverables: ['calendar-component', 'scheduler-service', 'availability-tracker']
      },
      {
        id: 'milestone-3',
        title: 'Risk Management Inteligente',
        description: 'Matriz de riesgos 5x5 con escalation automática',
        targetDate: new Date('2024-03-15'),
        actualDate: new Date('2024-03-14'),
        status: 'completed',
        progress: 100,
        owner: 'Risk Manager',
        dependencies: ['milestone-2'],
        deliverables: ['risk-matrix', 'escalation-system', 'risk-controls']
      },
      {
        id: 'milestone-4',
        title: 'Deliverable Tracker Avanzado',
        description: 'Quality scoring y workflow de aprobación multi-reviewer',
        targetDate: new Date('2024-04-01'),
        actualDate: new Date('2024-03-30'),
        status: 'completed',
        progress: 100,
        owner: 'Quality Manager',
        dependencies: ['milestone-3'],
        deliverables: ['quality-tracker', 'approval-workflow', 'deliverable-dashboard']
      },
      {
        id: 'milestone-5',
        title: 'Testing y Optimización Final',
        description: 'Pruebas integrales y optimización de performance',
        targetDate: new Date('2024-04-15'),
        status: 'in_progress',
        progress: 60,
        owner: 'QA Lead',
        dependencies: ['milestone-4'],
        deliverables: ['test-suite', 'performance-optimization', 'user-acceptance-tests']
      }
    ];
  }

  private getMockDependencies(): ProjectDependency[] {
    return [
      {
        id: 'dep-1',
        fromMilestone: 'milestone-1',
        toMilestone: 'milestone-2',
        type: 'finish_to_start',
        lag: 0
      },
      {
        id: 'dep-2',
        fromMilestone: 'milestone-2',
        toMilestone: 'milestone-3',
        type: 'finish_to_start',
        lag: 2
      },
      {
        id: 'dep-3',
        fromMilestone: 'milestone-3',
        toMilestone: 'milestone-4',
        type: 'finish_to_start',
        lag: 1
      },
      {
        id: 'dep-4',
        fromMilestone: 'milestone-4',
        toMilestone: 'milestone-5',
        type: 'finish_to_start',
        lag: 0
      }
    ];
  }
}
