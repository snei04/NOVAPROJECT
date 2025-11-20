import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Deliverable, 
  AcceptanceCriterion,
  QualityMetrics,
  ApprovalWorkflow,
  DeliverableMetrics,
  ImeviDeliverableComparison,
  DeliverableStatus,
  DeliverablePriority,
  DeliverableType,
  QualityTrend
} from '../models/deliverable.model';

@Injectable({
  providedIn: 'root'
})
export class DeliverableService {
  private http = inject(HttpClient);

  // Signals para estado reactivo
  private deliverablesSignal = signal<Deliverable[]>([]);
  private acceptanceCriteriaSignal = signal<AcceptanceCriterion[]>([]);
  private qualityMetricsSignal = signal<QualityMetrics[]>([]);
  private approvalWorkflowsSignal = signal<ApprovalWorkflow[]>([]);

  // Public readonly signals
  public deliverables = this.deliverablesSignal.asReadonly();
  public acceptanceCriteria = this.acceptanceCriteriaSignal.asReadonly();
  public qualityMetrics = this.qualityMetricsSignal.asReadonly();
  public approvalWorkflows = this.approvalWorkflowsSignal.asReadonly();

  // Computed signals para métricas
  public totalDeliverables = computed(() => this.deliverables().length);

  public deliverablesByStatus = computed(() => {
    const deliverables = this.deliverables();
    const statuses: Record<DeliverableStatus, number> = {
      not_started: 0, in_progress: 0, review: 0, approval: 0,
      rework: 0, completed: 0, cancelled: 0, on_hold: 0
    };
    
    deliverables.forEach(d => {
      statuses[d.status]++;
    });
    
    return statuses;
  });

  public deliverablesByPriority = computed(() => {
    const deliverables = this.deliverables();
    return {
      critical: deliverables.filter(d => d.priority === 'critical').length,
      high: deliverables.filter(d => d.priority === 'high').length,
      medium: deliverables.filter(d => d.priority === 'medium').length,
      low: deliverables.filter(d => d.priority === 'low').length
    };
  });

  public completedDeliverables = computed(() => 
    this.deliverables().filter(d => d.status === 'completed')
  );

  public delayedDeliverables = computed(() => {
    const now = new Date();
    return this.deliverables().filter(d => 
      d.plannedEndDate < now && 
      d.status !== 'completed' && 
      d.status !== 'cancelled'
    );
  });

  public averageQualityScore = computed(() => {
    const deliverables = this.deliverables();
    if (deliverables.length === 0) return 0;
    
    const totalScore = deliverables.reduce((sum, d) => sum + d.qualityScore, 0);
    return Math.round(totalScore / deliverables.length * 10) / 10;
  });

  public onTimeDeliveryRate = computed(() => {
    const completed = this.completedDeliverables();
    if (completed.length === 0) return 0;
    
    const onTime = completed.filter(d => 
      d.actualEndDate && d.actualEndDate <= d.plannedEndDate
    ).length;
    
    return Math.round((onTime / completed.length) * 100);
  });

  public pendingApprovals = computed(() => 
    this.deliverables().filter(d => d.status === 'approval')
  );

  // Computed para comparación con IMEVI
  public imeviComparison = computed((): ImeviDeliverableComparison => ({
    tracking: {
      imevi: 'Sin criterios claros de calidad ni tracking',
      novaproject: 'Criterios trackables con scoring automático',
      improvement: '+30% incremento calidad'
    },
    quality: {
      imevi: 'Evaluación subjetiva sin métricas',
      novaproject: 'Quality scoring automático multi-dimensional',
      improvement: '+40% objetividad'
    },
    approval: {
      imevi: 'Proceso manual sin workflow definido',
      novaproject: 'Workflow multi-reviewer con tracking',
      improvement: '+50% eficiencia aprobación'
    },
    roi: {
      costReduction: 1392000, // COP ahorrados
      timeReduction: 60, // % reducción tiempo
      qualityIncrease: 30 // % incremento calidad
    }
  }));

  // Métodos para cargar datos
  async loadDeliverables(): Promise<void> {
    try {
      // Mock data basado en problemas IMEVI
      const mockDeliverables: Deliverable[] = [
        {
          id: 'deliverable-1',
          title: 'Especificación de Requerimientos Funcionales',
          description: 'Documento detallado de requerimientos funcionales basado en entrevistas con stakeholders',
          type: 'document',
          category: 'requirement',
          plannedStartDate: new Date('2024-01-15'),
          plannedEndDate: new Date('2024-02-15'),
          actualStartDate: new Date('2024-01-16'),
          status: 'approval',
          progress: 95,
          priority: 'critical',
          owner: 'business-analyst',
          ownerName: 'Ana Martínez - Business Analyst',
          team: 'Análisis',
          contributors: [
            {
              userId: 'stakeholder-1',
              userName: 'María González',
              role: 'reviewer',
              contribution: 'Revisión de requerimientos VP',
              hoursAllocated: 8,
              hoursWorked: 6,
              startDate: new Date('2024-02-10'),
              endDate: new Date('2024-02-15')
            }
          ],
          acceptanceCriteria: [
            {
              id: 'criteria-1',
              deliverableId: 'deliverable-1',
              title: 'Cobertura completa de procesos críticos',
              description: 'Todos los procesos críticos identificados deben estar documentados',
              isTrackable: true,
              measurementMethod: 'percentage',
              targetValue: 100,
              currentValue: 95,
              unit: '%',
              status: 'partially_met',
              priority: 'must_have',
              validator: 'stakeholder-1',
              validatorName: 'María González',
              evidence: [],
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-02-10')
            }
          ],
          qualityMetrics: {
            deliverableId: 'deliverable-1',
            completeness: 95,
            timeliness: 90,
            accuracy: 88,
            compliance: 92,
            stakeholderSatisfaction: 8,
            technicalQuality: 9,
            defectsFound: 3,
            defectsResolved: 2,
            reviewCycles: 2,
            reworkHours: 4,
            overallScore: 91,
            qualityTrend: 'improving',
            lastCalculated: new Date()
          },
          qualityScore: 91,
          approvalWorkflow: {
            id: 'workflow-1',
            deliverableId: 'deliverable-1',
            requiredApprovers: [
              {
                level: 1,
                name: 'Revisión Técnica',
                description: 'Validación técnica de requerimientos',
                requiredApprovers: [
                  {
                    userId: 'tech-lead',
                    userName: 'Carlos Rodríguez',
                    role: 'technical_lead',
                    email: 'carlos.rodriguez@company.com',
                    isRequired: true,
                    canDelegate: false,
                    notificationPreferences: []
                  }
                ],
                minimumApprovals: 1,
                allowDelegation: false,
                timeoutDays: 3,
                isOptional: false,
                specificCriteria: ['Viabilidad técnica', 'Arquitectura compatible']
              },
              {
                level: 2,
                name: 'Aprobación de Negocio',
                description: 'Validación por stakeholders de negocio',
                requiredApprovers: [
                  {
                    userId: 'stakeholder-1',
                    userName: 'María González',
                    role: 'stakeholder',
                    email: 'maria.gonzalez@company.com',
                    isRequired: true,
                    canDelegate: true,
                    notificationPreferences: []
                  }
                ],
                minimumApprovals: 1,
                allowDelegation: true,
                timeoutDays: 5,
                isOptional: false,
                specificCriteria: ['Alineación con objetivos', 'Completitud funcional']
              }
            ],
            isSequential: true,
            currentLevel: 2,
            overallStatus: 'in_progress',
            approvalHistory: [
              {
                id: 'approval-1',
                level: 1,
                approverId: 'tech-lead',
                approverName: 'Carlos Rodríguez',
                decision: 'approved',
                decisionDate: new Date('2024-02-12'),
                comments: 'Requerimientos técnicamente viables. Arquitectura compatible.',
                conditionalApproval: false,
                isDelegated: false,
                attachments: [],
                createdAt: new Date('2024-02-12')
              }
            ],
            autoAdvance: true,
            reminderFrequency: 2,
            escalationDelay: 5,
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date('2024-02-12')
          },
          dependencies: [],
          blockers: [],
          attachments: [],
          documentation: [],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-12'),
          createdBy: 'business-analyst',
          lastModifiedBy: 'business-analyst',
          tags: ['imevi', 'requirements', 'critical'],
          estimatedHours: 80,
          actualHours: 76,
          budget: 2400000,
          actualCost: 2280000
        },
        {
          id: 'deliverable-2',
          title: 'Dashboard de Métricas de Proyecto',
          description: 'Dashboard interactivo para visualización de métricas y KPIs del proyecto',
          type: 'software',
          category: 'development',
          plannedStartDate: new Date('2024-02-01'),
          plannedEndDate: new Date('2024-03-01'),
          actualStartDate: new Date('2024-02-01'),
          status: 'in_progress',
          progress: 75,
          priority: 'high',
          owner: 'tech-lead',
          ownerName: 'Carlos Rodríguez - Tech Lead',
          team: 'Desarrollo',
          contributors: [
            {
              userId: 'frontend-dev',
              userName: 'Luis García',
              role: 'developer',
              contribution: 'Desarrollo frontend Angular',
              hoursAllocated: 60,
              hoursWorked: 45,
              startDate: new Date('2024-02-01')
            }
          ],
          acceptanceCriteria: [
            {
              id: 'criteria-2',
              deliverableId: 'deliverable-2',
              title: 'Métricas en tiempo real',
              description: 'Dashboard debe mostrar métricas actualizadas automáticamente',
              isTrackable: true,
              measurementMethod: 'automated_test',
              targetValue: 1,
              currentValue: 0.8,
              unit: 'score',
              status: 'in_progress',
              priority: 'must_have',
              validator: 'tech-lead',
              validatorName: 'Carlos Rodríguez',
              evidence: [],
              createdAt: new Date('2024-02-01'),
              updatedAt: new Date('2024-02-15')
            }
          ],
          qualityMetrics: {
            deliverableId: 'deliverable-2',
            completeness: 75,
            timeliness: 85,
            accuracy: 90,
            compliance: 88,
            technicalQuality: 8,
            usability: 7,
            maintainability: 8,
            defectsFound: 5,
            defectsResolved: 4,
            reviewCycles: 1,
            reworkHours: 8,
            overallScore: 82,
            qualityTrend: 'stable',
            lastCalculated: new Date()
          },
          qualityScore: 82,
          approvalWorkflow: {
            id: 'workflow-2',
            deliverableId: 'deliverable-2',
            requiredApprovers: [
              {
                level: 1,
                name: 'QA Review',
                description: 'Revisión de calidad y testing',
                requiredApprovers: [
                  {
                    userId: 'qa-lead',
                    userName: 'Patricia López',
                    role: 'quality_assurance',
                    email: 'patricia.lopez@company.com',
                    isRequired: true,
                    canDelegate: false,
                    notificationPreferences: []
                  }
                ],
                minimumApprovals: 1,
                allowDelegation: false,
                timeoutDays: 2,
                isOptional: false,
                specificCriteria: ['Testing completo', 'Performance aceptable']
              }
            ],
            isSequential: true,
            currentLevel: 0,
            overallStatus: 'not_started',
            approvalHistory: [],
            autoAdvance: false,
            reminderFrequency: 1,
            escalationDelay: 3,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01')
          },
          dependencies: [
            {
              id: 'dep-1',
              dependentDeliverableId: 'deliverable-2',
              dependsOnDeliverableId: 'deliverable-1',
              dependsOnDeliverableTitle: 'Especificación de Requerimientos',
              dependencyType: 'finish_to_start',
              status: 'active',
              isBlocking: true,
              description: 'Necesita requerimientos aprobados para finalizar desarrollo',
              createdAt: new Date('2024-02-01')
            }
          ],
          blockers: [],
          attachments: [],
          documentation: [],
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-15'),
          createdBy: 'tech-lead',
          lastModifiedBy: 'frontend-dev',
          tags: ['dashboard', 'metrics', 'angular'],
          estimatedHours: 120,
          actualHours: 90,
          budget: 3600000,
          actualCost: 2700000
        },
        {
          id: 'deliverable-3',
          title: 'Plan de Capacitación de Usuarios',
          description: 'Documento y materiales para capacitación de usuarios finales',
          type: 'training',
          category: 'training',
          plannedStartDate: new Date('2024-03-01'),
          plannedEndDate: new Date('2024-03-15'),
          status: 'not_started',
          progress: 0,
          priority: 'medium',
          owner: 'training-lead',
          ownerName: 'Sandra Pérez - Training Lead',
          team: 'Capacitación',
          contributors: [],
          acceptanceCriteria: [
            {
              id: 'criteria-3',
              deliverableId: 'deliverable-3',
              title: 'Cobertura de todos los roles',
              description: 'Material debe cubrir capacitación para todos los roles de usuario',
              isTrackable: true,
              measurementMethod: 'checklist',
              targetValue: 5,
              currentValue: 0,
              unit: 'roles',
              status: 'pending',
              priority: 'must_have',
              validator: 'stakeholder-1',
              validatorName: 'María González',
              evidence: [],
              createdAt: new Date('2024-03-01'),
              updatedAt: new Date('2024-03-01')
            }
          ],
          qualityMetrics: {
            deliverableId: 'deliverable-3',
            completeness: 0,
            timeliness: 100,
            accuracy: 0,
            compliance: 0,
            overallScore: 25,
            qualityTrend: 'stable',
            defectsFound: 0,
            defectsResolved: 0,
            reviewCycles: 0,
            reworkHours: 0,
            lastCalculated: new Date()
          },
          qualityScore: 25,
          approvalWorkflow: {
            id: 'workflow-3',
            deliverableId: 'deliverable-3',
            requiredApprovers: [],
            isSequential: true,
            currentLevel: 0,
            overallStatus: 'not_started',
            approvalHistory: [],
            autoAdvance: true,
            reminderFrequency: 3,
            escalationDelay: 7,
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-01')
          },
          dependencies: [
            {
              id: 'dep-2',
              dependentDeliverableId: 'deliverable-3',
              dependsOnDeliverableId: 'deliverable-2',
              dependsOnDeliverableTitle: 'Dashboard de Métricas',
              dependencyType: 'finish_to_start',
              status: 'active',
              isBlocking: true,
              description: 'Necesita dashboard completado para crear material de capacitación',
              createdAt: new Date('2024-03-01')
            }
          ],
          blockers: [],
          attachments: [],
          documentation: [],
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-01'),
          createdBy: 'training-lead',
          lastModifiedBy: 'training-lead',
          tags: ['training', 'documentation'],
          estimatedHours: 40,
          budget: 1200000
        }
      ];

      this.deliverablesSignal.set(mockDeliverables);
      await this.loadMockAcceptanceCriteria();
      await this.loadMockQualityMetrics();
      await this.loadMockApprovalWorkflows();
      
    } catch (error) {
      console.error('Error loading deliverables:', error);
      throw error;
    }
  }

  private async loadMockAcceptanceCriteria(): Promise<void> {
    const criteria = this.deliverables().flatMap(d => d.acceptanceCriteria);
    this.acceptanceCriteriaSignal.set(criteria);
  }

  private async loadMockQualityMetrics(): Promise<void> {
    const metrics = this.deliverables().map(d => d.qualityMetrics);
    this.qualityMetricsSignal.set(metrics);
  }

  private async loadMockApprovalWorkflows(): Promise<void> {
    const workflows = this.deliverables().map(d => d.approvalWorkflow);
    this.approvalWorkflowsSignal.set(workflows);
  }

  // Métodos para cálculos automáticos de calidad
  calculateQualityScore(deliverable: Deliverable): number {
    const metrics = deliverable.qualityMetrics;
    
    // Pesos para diferentes métricas
    const weights = {
      completeness: 0.3,
      timeliness: 0.2,
      accuracy: 0.25,
      compliance: 0.15,
      stakeholderSatisfaction: 0.1
    };
    
    let score = 0;
    score += metrics.completeness * weights.completeness;
    score += metrics.timeliness * weights.timeliness;
    score += metrics.accuracy * weights.accuracy;
    score += metrics.compliance * weights.compliance;
    
    if (metrics.stakeholderSatisfaction) {
      score += (metrics.stakeholderSatisfaction * 10) * weights.stakeholderSatisfaction;
    }
    
    return Math.round(score);
  }

  calculateAcceptanceCriteriaProgress(deliverableId: string): number {
    const criteria = this.acceptanceCriteria().filter(c => c.deliverableId === deliverableId);
    if (criteria.length === 0) return 0;
    
    const metCriteria = criteria.filter(c => c.status === 'met').length;
    return Math.round((metCriteria / criteria.length) * 100);
  }

  // Métodos para gestión de aprobaciones
  async submitForApproval(deliverableId: string): Promise<void> {
    const deliverable = this.getDeliverableById(deliverableId);
    if (!deliverable) return;

    // Actualizar estado
    this.deliverablesSignal.update(current =>
      current.map(d => d.id === deliverableId 
        ? { ...d, status: 'approval', updatedAt: new Date() }
        : d
      )
    );

    // Iniciar workflow de aprobación
    await this.startApprovalWorkflow(deliverableId);
  }

  private async startApprovalWorkflow(deliverableId: string): Promise<void> {
    // Lógica para iniciar workflow
    console.log('Starting approval workflow for deliverable:', deliverableId);
  }

  async approveDeliverable(deliverableId: string, approverId: string, comments: string): Promise<void> {
    // Lógica para aprobar entregable
    console.log('Approving deliverable:', deliverableId, 'by:', approverId);
  }

  // Métodos para análisis y métricas
  getDeliverableMetrics(): DeliverableMetrics {
    const deliverables = this.deliverables();
    
    return {
      totalDeliverables: this.totalDeliverables(),
      deliverablesByStatus: this.deliverablesByStatus(),
      deliverablesByPriority: this.deliverablesByPriority(),
      deliverablesByType: this.calculateDeliverablesByType(),
      averageQualityScore: this.averageQualityScore(),
      qualityTrend: this.calculateQualityTrend(),
      onTimeDeliveryRate: this.onTimeDeliveryRate(),
      averageDelayDays: this.calculateAverageDelayDays(),
      averageApprovalTime: this.calculateAverageApprovalTime(),
      approvalSuccessRate: this.calculateApprovalSuccessRate(),
      averageDefectsPerDeliverable: this.calculateAverageDefects(),
      defectResolutionRate: this.calculateDefectResolutionRate(),
      imeviComparison: this.imeviComparison()
    };
  }

  private calculateDeliverablesByType(): Record<DeliverableType, number> {
    const deliverables = this.deliverables();
    const types: Record<DeliverableType, number> = {
      document: 0, software: 0, design: 0, analysis: 0, report: 0,
      presentation: 0, training: 0, process: 0, other: 0
    };
    
    deliverables.forEach(d => {
      types[d.type]++;
    });
    
    return types;
  }

  private calculateQualityTrend(): QualityTrend {
    // Lógica simplificada - en implementación real sería más compleja
    const avgScore = this.averageQualityScore();
    if (avgScore >= 85) return 'improving';
    if (avgScore >= 70) return 'stable';
    return 'declining';
  }

  private calculateAverageDelayDays(): number {
    const delayed = this.delayedDeliverables();
    if (delayed.length === 0) return 0;
    
    const now = new Date();
    const totalDelayDays = delayed.reduce((sum, d) => {
      const delayMs = now.getTime() - d.plannedEndDate.getTime();
      return sum + (delayMs / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDelayDays / delayed.length);
  }

  private calculateAverageApprovalTime(): number {
    // Mock data - en implementación real calcularía tiempo real
    return 2.5; // días promedio
  }

  private calculateApprovalSuccessRate(): number {
    const workflows = this.approvalWorkflows();
    if (workflows.length === 0) return 0;
    
    const approved = workflows.filter(w => w.overallStatus === 'approved').length;
    return Math.round((approved / workflows.length) * 100);
  }

  private calculateAverageDefects(): number {
    const deliverables = this.deliverables();
    if (deliverables.length === 0) return 0;
    
    const totalDefects = deliverables.reduce((sum, d) => 
      sum + d.qualityMetrics.defectsFound, 0
    );
    
    return Math.round(totalDefects / deliverables.length * 10) / 10;
  }

  private calculateDefectResolutionRate(): number {
    const deliverables = this.deliverables();
    const totalDefects = deliverables.reduce((sum, d) => 
      sum + d.qualityMetrics.defectsFound, 0
    );
    const resolvedDefects = deliverables.reduce((sum, d) => 
      sum + d.qualityMetrics.defectsResolved, 0
    );
    
    return totalDefects > 0 ? Math.round((resolvedDefects / totalDefects) * 100) : 0;
  }

  // Métodos de utilidad
  getDeliverableById(id: string): Deliverable | undefined {
    return this.deliverables().find(d => d.id === id);
  }

  getDeliverablesByStatus(status: DeliverableStatus): Deliverable[] {
    return this.deliverables().filter(d => d.status === status);
  }

  getDeliverablesByPriority(priority: DeliverablePriority): Deliverable[] {
    return this.deliverables().filter(d => d.priority === priority);
  }

  getCriticalDeliverables(): Deliverable[] {
    return this.deliverables().filter(d => d.priority === 'critical');
  }

  // Métodos para refrescar datos
  async refreshData(): Promise<void> {
    await this.loadDeliverables();
  }

  // Getters para compatibilidad con componentes
  getAllDeliverables() {
    return this.deliverables();
  }

  getCompletedDeliverables() {
    return this.completedDeliverables();
  }

  getDelayedDeliverables() {
    return this.delayedDeliverables();
  }

  getPendingApprovals() {
    return this.pendingApprovals();
  }

  getImeviComparison() {
    return this.imeviComparison();
  }
}
