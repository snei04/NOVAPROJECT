import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Risk, 
  RiskControl, 
  RiskAssessment,
  EscalationEvent,
  RiskMetrics,
  RiskHeatmapData,
  ImeviComparison,
  RiskLevel,
  RiskCategory,
  RiskStatus,
  EscalationRule,
  MitigationPlan
} from '../models/risk.model';

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private http = inject(HttpClient);

  // Signals para estado reactivo
  private risksSignal = signal<Risk[]>([]);
  private controlsSignal = signal<RiskControl[]>([]);
  private assessmentsSignal = signal<RiskAssessment[]>([]);
  private escalationEventsSignal = signal<EscalationEvent[]>([]);

  // Public readonly signals
  public risks = this.risksSignal.asReadonly();
  public controls = this.controlsSignal.asReadonly();
  public assessments = this.assessmentsSignal.asReadonly();
  public escalationEvents = this.escalationEventsSignal.asReadonly();

  // Computed signals para métricas
  public totalRisks = computed(() => this.risks().length);

  public risksByLevel = computed(() => {
    const risks = this.risks();
    return {
      critical: risks.filter(r => r.riskLevel === 'critical').length,
      high: risks.filter(r => r.riskLevel === 'high').length,
      medium: risks.filter(r => r.riskLevel === 'medium').length,
      low: risks.filter(r => r.riskLevel === 'low').length
    };
  });

  public risksByCategory = computed(() => {
    const risks = this.risks();
    const categories: Record<RiskCategory, number> = {
      technical: 0, operational: 0, financial: 0, strategic: 0, compliance: 0,
      security: 0, resource: 0, schedule: 0, quality: 0, external: 0
    };
    
    risks.forEach(risk => {
      categories[risk.category]++;
    });
    
    return categories;
  });

  public risksByStatus = computed(() => {
    const risks = this.risks();
    const statuses: Record<RiskStatus, number> = {
      identified: 0, assessed: 0, active: 0, mitigating: 0, 
      monitoring: 0, closed: 0, realized: 0
    };
    
    risks.forEach(risk => {
      statuses[risk.status]++;
    });
    
    return statuses;
  });

  public criticalRisks = computed(() => 
    this.risks().filter(r => r.riskLevel === 'critical')
  );

  public highRisks = computed(() => 
    this.risks().filter(r => r.riskLevel === 'high')
  );

  public activeRisks = computed(() => 
    this.risks().filter(r => r.status === 'active' || r.status === 'mitigating')
  );

  public overdueControls = computed(() => {
    const now = new Date();
    return this.controls().filter(control => 
      control.dueDate < now && 
      control.implementationStatus !== 'active' &&
      control.implementationStatus !== 'discontinued'
    );
  });

  public recentEscalations = computed(() => {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.escalationEvents()
      .filter(event => event.triggeredAt >= last7Days)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  });

  public averageRiskScore = computed(() => {
    const risks = this.risks();
    if (risks.length === 0) return 0;
    
    const totalScore = risks.reduce((sum, risk) => sum + risk.automaticScore, 0);
    return Math.round(totalScore / risks.length * 10) / 10;
  });

  public controlEffectiveness = computed(() => {
    const controls = this.controls();
    if (controls.length === 0) return 0;
    
    const activeControls = controls.filter(c => c.implementationStatus === 'active');
    const totalEffectiveness = activeControls.reduce((sum, control) => sum + control.effectiveness, 0);
    
    return activeControls.length > 0 ? Math.round((totalEffectiveness / activeControls.length) * 20) : 0;
  });

  // Computed para comparación con IMEVI
  public imeviComparison = computed((): ImeviComparison => ({
    reactive: {
      description: 'Gestión reactiva limitada a seguimiento semanal',
      problems: [
        'Solo seguimiento semanal',
        'Sin alertas automáticas',
        'Escalation manual',
        'Controles sin fechas'
      ],
      cost: 3480000 // 20% del presupuesto IMEVI perdido en gestión reactiva
    },
    proactive: {
      description: 'Sistema inteligente con scoring automático y escalation',
      benefits: [
        'Scoring automático en tiempo real',
        'Escalation automática por reglas',
        'Controles con responsables y fechas',
        'Alertas proactivas críticas'
      ],
      savings: 2088000 // 60% de ahorro vs gestión reactiva
    },
    improvement: {
      percentage: 60,
      roi: 2088000,
      timeReduction: 70 // 70% menos tiempo en gestión de riesgos
    }
  }));

  // Métodos para cargar datos
  async loadRisks(): Promise<void> {
    try {
      // Mock data - después se conectará a la API real
      const mockRisks: Risk[] = [
        {
          id: 'risk-1',
          title: 'Retrasos por Vacaciones de Stakeholders Clave',
          description: 'Riesgo identificado en proyecto IMEVI: vacaciones de vicepresidencias pueden bloquear avances críticos',
          category: 'resource',
          type: 'threat',
          probability: 4,
          impact: 4,
          automaticScore: 16,
          riskScore: 16,
          riskLevel: 'high',
          status: 'active',
          priority: 'high',
          detectedDate: new Date('2024-01-05'),
          lastAssessmentDate: new Date('2024-01-10'),
          owner: 'project-manager',
          ownerName: 'Gerente de Proyecto',
          assignedTeam: 'PMO',
          controls: [],
          escalationRules: [
            {
              id: 'esc-rule-1',
              riskId: 'risk-1',
              triggerConditions: [
                {
                  id: 'trigger-1',
                  type: 'score_increase',
                  condition: 'score >= 20',
                  threshold: 20
                }
              ],
              escalationLevels: [
                {
                  level: 1,
                  recipients: ['project-manager'],
                  recipientNames: ['Gerente de Proyecto'],
                  message: 'Riesgo crítico requiere atención inmediata',
                  requiredActions: ['Evaluar impacto', 'Definir plan de contingencia'],
                  timeoutHours: 4
                },
                {
                  level: 2,
                  recipients: ['director-it'],
                  recipientNames: ['Director de IT'],
                  message: 'Escalation: Riesgo crítico sin resolución',
                  requiredActions: ['Intervención directiva', 'Recursos adicionales'],
                  timeoutHours: 24
                }
              ],
              isActive: true,
              autoEscalate: true,
              escalationDelay: 2,
              notificationChannels: ['email', 'teams'],
              createdAt: new Date('2024-01-05'),
              updatedAt: new Date('2024-01-05')
            }
          ],
          escalationHistory: [],
          affectedAreas: ['schedule', 'stakeholders'],
          potentialDelay: 14, // días
          potentialCost: 2400000, // COP
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-10'),
          createdBy: 'system',
          tags: ['imevi', 'stakeholders', 'schedule']
        },
        {
          id: 'risk-2',
          title: 'Falta de Seguimiento Sistemático',
          description: 'Basado en IMEVI: solo 3 registros en 9 semanas indica falta de seguimiento sistemático',
          category: 'operational',
          type: 'threat',
          probability: 5,
          impact: 3,
          automaticScore: 15,
          riskScore: 15,
          riskLevel: 'high',
          status: 'mitigating',
          priority: 'high',
          detectedDate: new Date('2024-01-03'),
          lastAssessmentDate: new Date('2024-01-12'),
          owner: 'pmo-lead',
          ownerName: 'Líder PMO',
          assignedTeam: 'PMO',
          controls: [],
          escalationRules: [],
          escalationHistory: [],
          affectedAreas: ['quality', 'schedule'],
          potentialDelay: 7,
          potentialCost: 1200000,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-12'),
          createdBy: 'pmo-lead',
          tags: ['imevi', 'tracking', 'process']
        },
        {
          id: 'risk-3',
          title: 'Dependencias Técnicas No Identificadas',
          description: 'Riesgo técnico de dependencias no mapeadas que pueden causar bloqueos',
          category: 'technical',
          type: 'threat',
          probability: 3,
          impact: 4,
          automaticScore: 12,
          riskScore: 12,
          riskLevel: 'medium',
          status: 'active',
          priority: 'medium',
          detectedDate: new Date('2024-01-08'),
          lastAssessmentDate: new Date('2024-01-08'),
          owner: 'tech-lead',
          ownerName: 'Líder Técnico',
          assignedTeam: 'Desarrollo',
          controls: [],
          escalationRules: [],
          escalationHistory: [],
          affectedAreas: ['schedule', 'quality'],
          potentialDelay: 5,
          potentialCost: 800000,
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08'),
          createdBy: 'tech-lead',
          tags: ['technical', 'dependencies']
        },
        {
          id: 'risk-4',
          title: 'Presupuesto Insuficiente para Scope Creep',
          description: 'Riesgo financiero de que cambios en alcance excedan el presupuesto disponible',
          category: 'financial',
          type: 'threat',
          probability: 2,
          impact: 5,
          automaticScore: 10,
          riskScore: 10,
          riskLevel: 'medium',
          status: 'monitoring',
          priority: 'medium',
          detectedDate: new Date('2024-01-06'),
          lastAssessmentDate: new Date('2024-01-11'),
          owner: 'finance-manager',
          ownerName: 'Gerente Financiero',
          assignedTeam: 'Finanzas',
          controls: [],
          escalationRules: [],
          escalationHistory: [],
          affectedAreas: ['budget', 'scope'],
          potentialDelay: 0,
          potentialCost: 5000000,
          createdAt: new Date('2024-01-06'),
          updatedAt: new Date('2024-01-11'),
          createdBy: 'finance-manager',
          tags: ['budget', 'scope']
        }
      ];

      this.risksSignal.set(mockRisks);
      await this.loadMockControls();
      await this.loadMockAssessments();
      await this.loadMockEscalations();
      
    } catch (error) {
      console.error('Error loading risks:', error);
      throw error;
    }
  }

  private async loadMockControls(): Promise<void> {
    const mockControls: RiskControl[] = [
      {
        id: 'control-1',
        riskId: 'risk-1',
        title: 'Mapeo de Disponibilidad de Stakeholders',
        description: 'Implementar sistema de mapeo proactivo de disponibilidad de stakeholders clave',
        type: 'preventive',
        effectiveness: 4,
        implementationStatus: 'implementing',
        assignee: 'stakeholder-manager',
        assigneeName: 'Gerente de Stakeholders',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 1 semana
        lastReviewDate: new Date('2024-01-10'),
        nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        reviewFrequency: 'weekly',
        evidence: [],
        notes: [
          'Iniciada implementación del calendario de disponibilidad',
          'Integración con sistema de stakeholders en progreso'
        ],
        implementationCost: 500000,
        maintenanceCost: 50000,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'control-2',
        riskId: 'risk-1',
        title: 'Plan de Contingencia para Ausencias',
        description: 'Definir plan de contingencia para cuando stakeholders clave no estén disponibles',
        type: 'corrective',
        effectiveness: 3,
        implementationStatus: 'planned',
        assignee: 'project-manager',
        assigneeName: 'Gerente de Proyecto',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // En 2 semanas
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reviewFrequency: 'biweekly',
        evidence: [],
        notes: ['Pendiente definición de stakeholders alternativos'],
        implementationCost: 200000,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05')
      },
      {
        id: 'control-3',
        riskId: 'risk-2',
        title: 'Dashboard de Seguimiento Automático',
        description: 'Implementar dashboard con métricas automáticas y alertas proactivas',
        type: 'detective',
        effectiveness: 5,
        implementationStatus: 'active',
        assignee: 'tech-lead',
        assigneeName: 'Líder Técnico',
        dueDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-13'),
        lastReviewDate: new Date('2024-01-13'),
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reviewFrequency: 'weekly',
        evidence: [
          {
            id: 'evidence-1',
            type: 'screenshot',
            title: 'Dashboard implementado',
            uploadedAt: new Date('2024-01-13'),
            uploadedBy: 'tech-lead'
          }
        ],
        notes: [
          'Dashboard implementado exitosamente',
          'Métricas automáticas funcionando',
          'Alertas configuradas'
        ],
        implementationCost: 800000,
        maintenanceCost: 100000,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-13')
      }
    ];

    this.controlsSignal.set(mockControls);
  }

  private async loadMockAssessments(): Promise<void> {
    const mockAssessments: RiskAssessment[] = [
      {
        id: 'assessment-1',
        riskId: 'risk-1',
        assessmentDate: new Date('2024-01-10'),
        assessor: 'project-manager',
        assessorName: 'Gerente de Proyecto',
        probabilityScore: 4,
        impactScore: 4,
        overallScore: 16,
        probabilityChange: 0,
        impactChange: 0,
        trend: 'stable',
        reasoning: 'Riesgo se mantiene alto debido a período vacacional próximo',
        evidenceProvided: [
          'Calendario de vacaciones de VP',
          'Cronograma de hitos críticos'
        ],
        recommendations: [
          {
            id: 'rec-1',
            type: 'control_improvement',
            priority: 'high',
            description: 'Acelerar implementación del sistema de disponibilidad',
            estimatedEffort: 40,
            estimatedCost: 600000,
            expectedBenefit: 'Reducción del riesgo a nivel medio'
          }
        ],
        nextAssessmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-10')
      }
    ];

    this.assessmentsSignal.set(mockAssessments);
  }

  private async loadMockEscalations(): Promise<void> {
    const mockEscalations: EscalationEvent[] = [
      {
        id: 'escalation-1',
        riskId: 'risk-1',
        escalationRuleId: 'esc-rule-1',
        level: 1,
        triggeredBy: {
          id: 'trigger-1',
          type: 'score_increase',
          condition: 'score >= 16',
          threshold: 16
        },
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
        escalatedTo: ['project-manager'],
        notificationsSent: [
          {
            id: 'notif-1',
            channel: 'email',
            recipient: 'project-manager',
            sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            delivered: true,
            opened: true,
            responded: false
          }
        ],
        acknowledgedBy: 'project-manager',
        acknowledgedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
        response: 'Revisando plan de contingencia y acelerando controles',
        actionsTaken: [
          'Revisión de disponibilidad de stakeholders',
          'Priorización de controles preventivos'
        ],
        status: 'in_progress',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    this.escalationEventsSignal.set(mockEscalations);
  }

  // Métodos para cálculos automáticos
  calculateRiskScore(probability: number, impact: number): number {
    return probability * impact;
  }

  determineRiskLevel(score: number): RiskLevel {
    if (score >= 20) return 'critical';
    if (score >= 15) return 'high';
    if (score >= 8) return 'medium';
    return 'low';
  }

  // Métodos para análisis
  getRiskById(id: string): Risk | undefined {
    return this.risks().find(r => r.id === id);
  }

  getRisksByCategory(category: RiskCategory): Risk[] {
    return this.risks().filter(r => r.category === category);
  }

  getRisksByLevel(level: RiskLevel): Risk[] {
    return this.risks().filter(r => r.riskLevel === level);
  }

  getControlsByRisk(riskId: string): RiskControl[] {
    return this.controls().filter(c => c.riskId === riskId);
  }

  // Métodos para heatmap
  generateHeatmapData(): RiskHeatmapData[] {
    const heatmapData: RiskHeatmapData[] = [];
    const risks = this.risks();

    // Crear matriz 5x5 para probabilidad vs impacto
    for (let probability = 1; probability <= 5; probability++) {
      for (let impact = 1; impact <= 5; impact++) {
        const cellRisks = risks.filter(r => 
          r.probability === probability && r.impact === impact
        );
        
        if (cellRisks.length > 0) {
          heatmapData.push({
            probability,
            impact,
            riskCount: cellRisks.length,
            risks: cellRisks
          });
        }
      }
    }

    return heatmapData;
  }

  // Métodos para métricas
  getRiskMetrics(): RiskMetrics {
    return {
      totalRisks: this.totalRisks(),
      risksByLevel: this.risksByLevel(),
      risksByCategory: this.risksByCategory(),
      risksByStatus: this.risksByStatus(),
      averageRiskScore: this.averageRiskScore(),
      trendsLast30Days: this.generateTrendData(),
      topRisks: this.getTopRisks(),
      overdueControls: this.overdueControls(),
      recentEscalations: this.recentEscalations(),
      controlEffectiveness: this.controlEffectiveness()
    };
  }

  private generateTrendData() {
    // Mock trend data - en implementación real vendría de históricos
    const trends = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date,
        totalRisks: this.totalRisks() + Math.floor(Math.random() * 3) - 1,
        criticalRisks: this.criticalRisks().length + Math.floor(Math.random() * 2),
        highRisks: this.highRisks().length + Math.floor(Math.random() * 2),
        averageScore: this.averageRiskScore() + (Math.random() * 2 - 1)
      });
    }
    
    return trends;
  }

  private getTopRisks(): Risk[] {
    return this.risks()
      .sort((a, b) => b.automaticScore - a.automaticScore)
      .slice(0, 5);
  }

  // Métodos para escalation automática
  async checkEscalationRules(): Promise<void> {
    const risks = this.risks();
    
    for (const risk of risks) {
      for (const rule of risk.escalationRules) {
        if (rule.isActive && rule.autoEscalate) {
          await this.evaluateEscalationRule(risk, rule);
        }
      }
    }
  }

  private async evaluateEscalationRule(risk: Risk, rule: EscalationRule): Promise<void> {
    for (const trigger of rule.triggerConditions) {
      if (this.shouldTriggerEscalation(risk, trigger)) {
        await this.triggerEscalation(risk, rule, trigger);
      }
    }
  }

  private shouldTriggerEscalation(risk: Risk, trigger: any): boolean {
    switch (trigger.type) {
      case 'score_increase':
        return risk.automaticScore >= (trigger.threshold || 15);
      case 'overdue_control':
        const overdueControls = this.getControlsByRisk(risk.id)
          .filter(c => c.dueDate < new Date() && c.implementationStatus !== 'active');
        return overdueControls.length > 0;
      case 'no_update':
        const daysSinceUpdate = (Date.now() - risk.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate >= (trigger.timeframe || 7);
      default:
        return false;
    }
  }

  private async triggerEscalation(risk: Risk, rule: EscalationRule, trigger: any): Promise<void> {
    // Verificar si ya hay una escalation reciente para evitar spam
    const recentEscalations = this.escalationEvents()
      .filter(e => e.riskId === risk.id && e.escalationRuleId === rule.id);
    
    const lastEscalation = recentEscalations
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())[0];
    
    if (lastEscalation) {
      const hoursSinceLastEscalation = (Date.now() - lastEscalation.triggeredAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastEscalation < rule.escalationDelay) {
        return; // Muy pronto para otra escalation
      }
    }

    // Crear evento de escalation
    const escalationEvent: EscalationEvent = {
      id: `escalation-${Date.now()}`,
      riskId: risk.id,
      escalationRuleId: rule.id,
      level: 1,
      triggeredBy: trigger,
      triggeredAt: new Date(),
      escalatedTo: rule.escalationLevels[0].recipients,
      notificationsSent: [],
      actionsTaken: [],
      status: 'triggered',
      createdAt: new Date()
    };

    // Actualizar signal
    this.escalationEventsSignal.update(current => [...current, escalationEvent]);

    // En implementación real, aquí se enviarían las notificaciones
    console.log('Escalation triggered:', escalationEvent);
  }

  // Métodos para refrescar datos
  async refreshData(): Promise<void> {
    await this.loadRisks();
    await this.checkEscalationRules();
  }

  // Getters para compatibilidad con componentes
  getAllRisks() {
    return this.risks();
  }

  getCriticalRisks() {
    return this.criticalRisks();
  }

  getActiveRisks() {
    return this.activeRisks();
  }

  getOverdueControls() {
    return this.overdueControls();
  }

  getRecentEscalations() {
    return this.recentEscalations();
  }

  getImeviComparison() {
    return this.imeviComparison();
  }
}
