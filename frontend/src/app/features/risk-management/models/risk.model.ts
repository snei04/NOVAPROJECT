export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  type: RiskType;
  
  // Scoring automático
  probability: RiskProbability; // 1-5
  impact: RiskImpact; // 1-5
  automaticScore: number; // Calculado: probability * impact
  riskScore: number; // Alias para automaticScore (compatibilidad)
  riskLevel: RiskLevel; // Derivado del score
  
  // Estado y seguimiento
  status: RiskStatus;
  priority: RiskPriority;
  detectedDate: Date;
  lastAssessmentDate: Date;
  
  // Ownership y responsabilidad
  owner: string; // ID del responsable principal
  ownerName: string;
  assignedTeam?: string;
  
  // Controles y mitigación
  controls: RiskControl[];
  mitigationPlan?: MitigationPlan;
  contingencyPlan?: ContingencyPlan;
  
  // Escalation automática
  escalationRules: EscalationRule[];
  escalationHistory: EscalationEvent[];
  
  // Impacto en proyecto
  affectedAreas: ProjectArea[];
  potentialDelay: number; // días
  potentialCost: number; // COP
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

export interface RiskControl {
  id: string;
  riskId: string;
  title: string;
  description: string;
  type: ControlType;
  
  // Efectividad
  effectiveness: ControlEffectiveness; // 1-5
  implementationStatus: ControlStatus;
  
  // Responsabilidad
  assignee: string;
  assigneeName: string;
  dueDate: Date;
  completedDate?: Date;
  
  // Seguimiento
  lastReviewDate?: Date;
  nextReviewDate: Date;
  reviewFrequency: ReviewFrequency;
  
  // Evidencia y documentación
  evidence: ControlEvidence[];
  notes: string[];
  
  // Costos
  implementationCost?: number;
  maintenanceCost?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface MitigationPlan {
  id: string;
  riskId: string;
  strategy: MitigationStrategy;
  actions: MitigationAction[];
  timeline: PlanTimeline;
  budget: number;
  owner: string;
  ownerName: string;
  kpis: PlanKPI[];
  status: PlanStatus;
  effectiveness: number; // 0-100%
  createdAt: Date;
  updatedAt: Date;
}

export interface ContingencyPlan {
  id: string;
  riskId: string;
  triggerConditions: string[];
  actions: ContingencyAction[];
  resources: PlanResource[];
  timeline: PlanTimeline;
  owner: string;
  ownerName: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContingencyAction {
  id: string;
  description: string;
  priority: ActionPriority;
  estimatedDuration: number; // hours
  requiredResources: string[];
  owner: string;
  status: ActionStatus;
  completedAt?: Date;
}

export interface MitigationAction {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  
  // Programación
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  
  // Responsabilidad
  assignee: string;
  assigneeName: string;
  
  // Estado y progreso
  status: ActionStatus;
  progress: number; // 0-100%
  
  // Dependencias
  dependencies: string[]; // IDs de otras acciones
  blockers: ActionBlocker[];
  
  // Recursos
  estimatedHours: number;
  actualHours?: number;
  cost: number;
  
  // Seguimiento
  updates: ActionUpdate[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationRule {
  id: string;
  riskId: string;
  
  // Condiciones de trigger
  triggerConditions: EscalationTrigger[];
  
  // Escalation path
  escalationLevels: EscalationLevel[];
  
  // Configuración
  isActive: boolean;
  autoEscalate: boolean;
  escalationDelay: number; // horas
  
  // Notificaciones
  notificationChannels: NotificationChannel[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationEvent {
  id: string;
  riskId: string;
  escalationRuleId: string;
  
  // Detalles del evento
  level: number;
  triggeredBy: EscalationTrigger;
  triggeredAt: Date;
  
  // Destinatarios
  escalatedTo: string[];
  notificationsSent: NotificationRecord[];
  
  // Respuesta
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  response?: string;
  actionsTaken: string[];
  
  // Estado
  status: EscalationStatus;
  resolvedAt?: Date;
  
  createdAt: Date;
}

export interface RiskAssessment {
  id: string;
  riskId: string;
  
  // Evaluación
  assessmentDate: Date;
  assessor: string;
  assessorName: string;
  
  // Scores
  probabilityScore: number; // 1-5
  impactScore: number; // 1-5
  overallScore: number; // calculado
  
  // Cambios desde última evaluación
  probabilityChange: number;
  impactChange: number;
  trend: RiskTrend;
  
  // Justificación
  reasoning: string;
  evidenceProvided: string[];
  
  // Recomendaciones
  recommendations: AssessmentRecommendation[];
  
  // Próxima evaluación
  nextAssessmentDate: Date;
  
  createdAt: Date;
}

export interface RiskReport {
  id: string;
  reportType: ReportType;
  generatedAt: Date;
  generatedBy: string;
  
  // Período del reporte
  periodStart: Date;
  periodEnd: Date;
  
  // Métricas generales
  totalRisks: number;
  newRisks: number;
  closedRisks: number;
  escalatedRisks: number;
  
  // Distribución por nivel
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // Tendencias
  riskTrends: RiskTrendData[];
  
  // Top riesgos
  topRisks: Risk[];
  
  // Efectividad de controles
  controlEffectiveness: ControlEffectivenessData[];
  
  // Recomendaciones
  executiveRecommendations: string[];
  
  // Comparación con IMEVI
  imeviComparison: {
    reactiveMgmt: string;
    proactiveMgmt: string;
    improvement: string;
  };
}

// Enums y tipos
export type RiskCategory = 
  | 'technical' 
  | 'operational' 
  | 'financial' 
  | 'strategic' 
  | 'compliance' 
  | 'security' 
  | 'resource' 
  | 'schedule' 
  | 'quality' 
  | 'external';

export type RiskType = 
  | 'threat' 
  | 'opportunity' 
  | 'issue' 
  | 'assumption' 
  | 'dependency';

export type RiskProbability = 1 | 2 | 3 | 4 | 5;
export type RiskImpact = 1 | 2 | 3 | 4 | 5;

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskStatus = 
  | 'identified' 
  | 'assessed' 
  | 'active' 
  | 'mitigating' 
  | 'monitoring' 
  | 'closed' 
  | 'realized';

export type RiskPriority = 'critical' | 'high' | 'medium' | 'low';

export type ControlType = 
  | 'preventive' 
  | 'detective' 
  | 'corrective' 
  | 'compensating';

export type ControlEffectiveness = 1 | 2 | 3 | 4 | 5;

export type ControlStatus = 
  | 'planned' 
  | 'implementing' 
  | 'active' 
  | 'ineffective' 
  | 'discontinued';

export type ReviewFrequency = 
  | 'daily' 
  | 'weekly' 
  | 'biweekly' 
  | 'monthly' 
  | 'quarterly';

export type MitigationStrategy = 
  | 'avoid' 
  | 'mitigate' 
  | 'transfer' 
  | 'accept' 
  | 'monitor';

export type ActionType = 
  | 'process_change' 
  | 'training' 
  | 'technology' 
  | 'documentation' 
  | 'communication' 
  | 'monitoring';

export type ActionStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'blocked' 
  | 'cancelled';

export type PlanStatus = 
  | 'draft' 
  | 'approved' 
  | 'executing' 
  | 'completed' 
  | 'cancelled';

export type EscalationStatus = 
  | 'triggered' 
  | 'acknowledged' 
  | 'in_progress' 
  | 'resolved' 
  | 'expired';

export type RiskTrend = 'increasing' | 'stable' | 'decreasing';

export type ReportType = 
  | 'executive_summary' 
  | 'detailed_analysis' 
  | 'trend_report' 
  | 'control_effectiveness';

export type ProjectArea = 
  | 'scope' 
  | 'schedule' 
  | 'budget' 
  | 'quality' 
  | 'resources' 
  | 'stakeholders';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'teams' | 'slack';

// Interfaces auxiliares
export interface ControlEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'report' | 'audit';
  title: string;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface PlanTimeline {
  startDate: Date;
  endDate: Date;
  milestones: PlanMilestone[];
}

export interface PlanMilestone {
  id: string;
  title: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
}

export interface PlanKPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ActionBlocker {
  id: string;
  description: string;
  type: 'resource' | 'approval' | 'dependency' | 'external';
  blockedSince: Date;
  estimatedResolution?: Date;
  owner: string;
}

export interface ActionUpdate {
  id: string;
  date: Date;
  author: string;
  authorName: string;
  progress: number;
  notes: string;
  attachments?: string[];
}

export interface EscalationTrigger {
  id: string;
  type: 'score_increase' | 'overdue_control' | 'no_update' | 'manual';
  condition: string;
  threshold?: number;
  timeframe?: number; // horas
}

export interface EscalationLevel {
  level: number;
  recipients: string[];
  recipientNames: string[];
  message: string;
  requiredActions: string[];
  timeoutHours: number;
}

export interface NotificationRecord {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  sentAt: Date;
  delivered: boolean;
  opened?: boolean;
  responded?: boolean;
}

export interface AssessmentRecommendation {
  id: string;
  type: 'control_improvement' | 'mitigation_update' | 'escalation' | 'closure';
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedEffort: number; // horas
  estimatedCost: number;
  expectedBenefit: string;
}

export interface RiskTrendData {
  date: Date;
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  averageScore: number;
}

export interface ControlEffectivenessData {
  controlType: ControlType;
  totalControls: number;
  effectiveControls: number;
  averageEffectiveness: number;
  trend: 'improving' | 'stable' | 'declining';
}

// Interfaces para análisis y dashboards
export interface RiskMetrics {
  totalRisks: number;
  risksByLevel: Record<RiskLevel, number>;
  risksByCategory: Record<RiskCategory, number>;
  risksByStatus: Record<RiskStatus, number>;
  averageRiskScore: number;
  trendsLast30Days: RiskTrendData[];
  topRisks: Risk[];
  overdueControls: RiskControl[];
  recentEscalations: EscalationEvent[];
  controlEffectiveness: number; // 0-100%
}

export interface RiskHeatmapData {
  probability: number;
  impact: number;
  riskCount: number;
  risks: Risk[];
}

export interface ImeviComparison {
  reactive: {
    description: string;
    problems: string[];
    cost: number;
  };
  proactive: {
    description: string;
    benefits: string[];
    savings: number;
  };
  improvement: {
    percentage: number;
    roi: number;
    timeReduction: number;
  };
}

// Interfaces adicionales faltantes
export interface PlanResource {
  id: string;
  name: string;
  type: 'human' | 'financial' | 'technical' | 'material';
  quantity: number;
  cost: number;
  availability: string;
}

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
