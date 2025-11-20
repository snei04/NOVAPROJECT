export interface Deliverable {
  id: string;
  title: string;
  description: string;
  type: DeliverableType;
  category: DeliverableCategory;
  
  // Programación y fechas
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Estado y progreso
  status: DeliverableStatus;
  progress: number; // 0-100%
  priority: DeliverablePriority;
  
  // Ownership y responsabilidad
  owner: string; // ID del responsable principal
  ownerName: string;
  team: string;
  contributors: DeliverableContributor[];
  
  // Criterios de aceptación trackables
  acceptanceCriteria: AcceptanceCriterion[];
  
  // Quality scoring automático
  qualityMetrics: QualityMetrics;
  qualityScore: number; // 0-100, calculado automáticamente
  
  // Workflow de aprobación multi-reviewer
  approvalWorkflow: ApprovalWorkflow;
  
  // Dependencias
  dependencies: DeliverableDependency[];
  blockers: DeliverableBlocker[];
  
  // Archivos y documentación
  attachments: DeliverableAttachment[];
  documentation: DocumentationItem[];
  
  // Tracking y auditoría
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  
  // Metadata
  tags: string[];
  estimatedHours: number;
  actualHours?: number;
  budget?: number;
  actualCost?: number;
}

export interface AcceptanceCriterion {
  id: string;
  deliverableId: string;
  title: string;
  description: string;
  
  // Criterio trackable
  isTrackable: boolean;
  measurementMethod: MeasurementMethod;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  
  // Estado
  status: CriterionStatus;
  priority: CriterionPriority;
  
  // Validación
  validator: string; // ID del validador
  validatorName: string;
  validatedAt?: Date;
  validationNotes?: string;
  
  // Evidencia
  evidence: CriterionEvidence[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityMetrics {
  deliverableId: string;
  
  // Métricas automáticas
  completeness: number; // 0-100% - criterios cumplidos
  timeliness: number; // 0-100% - entrega a tiempo
  accuracy: number; // 0-100% - calidad técnica
  compliance: number; // 0-100% - cumplimiento estándares
  
  // Métricas manuales
  stakeholderSatisfaction?: number; // 1-10
  technicalQuality?: number; // 1-10
  usability?: number; // 1-10
  maintainability?: number; // 1-10
  
  // Defectos y revisiones
  defectsFound: number;
  defectsResolved: number;
  reviewCycles: number;
  reworkHours: number;
  
  // Calculado automáticamente
  overallScore: number; // 0-100
  qualityTrend: QualityTrend;
  
  lastCalculated: Date;
}

export interface ApprovalWorkflow {
  id: string;
  deliverableId: string;
  
  // Configuración del workflow
  requiredApprovers: ApprovalLevel[];
  isSequential: boolean; // true = secuencial, false = paralelo
  
  // Estado actual
  currentLevel: number;
  overallStatus: WorkflowStatus;
  
  // Historial de aprobaciones
  approvalHistory: ApprovalRecord[];
  
  // Configuración
  autoAdvance: boolean; // avanzar automáticamente al siguiente nivel
  reminderFrequency: number; // días
  escalationDelay: number; // días sin respuesta
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalLevel {
  level: number;
  name: string;
  description: string;
  
  // Aprobadores requeridos
  requiredApprovers: Approver[];
  minimumApprovals: number; // mínimo de aprobaciones requeridas
  
  // Configuración
  allowDelegation: boolean;
  timeoutDays: number;
  isOptional: boolean;
  
  // Criterios específicos para este nivel
  specificCriteria: string[];
}

export interface Approver {
  userId: string;
  userName: string;
  role: ApproverRole;
  email: string;
  
  // Configuración
  isRequired: boolean;
  canDelegate: boolean;
  delegatedTo?: string;
  
  // Notificaciones
  notificationPreferences: NotificationPreference[];
}

export interface ApprovalRecord {
  id: string;
  level: number;
  approverId: string;
  approverName: string;
  
  // Decisión
  decision: ApprovalDecision;
  decisionDate: Date;
  comments: string;
  
  // Condiciones
  conditionalApproval: boolean;
  conditions?: string[];
  
  // Delegación
  isDelegated: boolean;
  delegatedFrom?: string;
  
  // Attachments
  attachments: string[];
  
  createdAt: Date;
}

export interface DeliverableContributor {
  userId: string;
  userName: string;
  role: ContributorRole;
  contribution: string;
  hoursAllocated: number;
  hoursWorked?: number;
  startDate: Date;
  endDate?: Date;
}

export interface DeliverableDependency {
  id: string;
  dependentDeliverableId: string;
  dependsOnDeliverableId: string;
  dependsOnDeliverableTitle: string;
  
  // Tipo de dependencia
  dependencyType: DependencyType;
  
  // Estado
  status: DependencyStatus;
  isBlocking: boolean;
  
  // Fechas
  expectedResolutionDate?: Date;
  actualResolutionDate?: Date;
  
  description: string;
  createdAt: Date;
}

export interface DeliverableBlocker {
  id: string;
  deliverableId: string;
  title: string;
  description: string;
  
  // Clasificación
  type: BlockerType;
  severity: BlockerSeverity;
  
  // Estado
  status: BlockerStatus;
  
  // Responsabilidad
  assignee: string;
  assigneeName: string;
  
  // Fechas
  identifiedDate: Date;
  expectedResolutionDate?: Date;
  actualResolutionDate?: Date;
  
  // Impacto
  impactDescription: string;
  delayDays: number;
  additionalCost: number;
  
  // Resolución
  resolutionPlan?: string;
  resolutionActions: BlockerAction[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverableAttachment {
  id: string;
  deliverableId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  
  // Metadata
  title: string;
  description?: string;
  category: AttachmentCategory;
  
  // Versionado
  version: string;
  isLatestVersion: boolean;
  previousVersionId?: string;
  
  // Acceso
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  
  // URL y storage
  fileUrl: string;
  storageLocation: string;
  
  // Validación
  isValidated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
}

export interface DocumentationItem {
  id: string;
  deliverableId: string;
  title: string;
  content: string;
  type: DocumentationType;
  
  // Estado
  status: DocumentationStatus;
  
  // Ownership
  author: string;
  authorName: string;
  
  // Versionado
  version: string;
  changeLog: string;
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
  
  // Aprobación
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

// Interfaces auxiliares
export interface CriterionEvidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  fileUrl?: string;
  providedBy: string;
  providedAt: Date;
}

export interface BlockerAction {
  id: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: ActionStatus;
  completedAt?: Date;
}

export interface NotificationPreference {
  channel: NotificationChannel;
  enabled: boolean;
  timing: NotificationTiming;
}

// Enums y tipos
export type DeliverableType = 
  | 'document' 
  | 'software' 
  | 'design' 
  | 'analysis' 
  | 'report' 
  | 'presentation' 
  | 'training' 
  | 'process' 
  | 'other';

export type DeliverableCategory = 
  | 'requirement' 
  | 'design' 
  | 'development' 
  | 'testing' 
  | 'deployment' 
  | 'documentation' 
  | 'training' 
  | 'support';

export type DeliverableStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'review' 
  | 'approval' 
  | 'rework' 
  | 'completed' 
  | 'cancelled' 
  | 'on_hold';

export type DeliverablePriority = 'critical' | 'high' | 'medium' | 'low';

export type MeasurementMethod = 
  | 'binary' 
  | 'numeric' 
  | 'percentage' 
  | 'checklist' 
  | 'manual_review' 
  | 'automated_test';

export type CriterionStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'met' 
  | 'not_met' 
  | 'partially_met' 
  | 'waived';

export type CriterionPriority = 'must_have' | 'should_have' | 'nice_to_have';

export type QualityTrend = 'improving' | 'stable' | 'declining';

export type WorkflowStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled' 
  | 'expired';

export type ApproverRole = 
  | 'technical_lead' 
  | 'business_analyst' 
  | 'project_manager' 
  | 'stakeholder' 
  | 'quality_assurance' 
  | 'client';

export type ApprovalDecision = 
  | 'approved' 
  | 'rejected' 
  | 'conditional' 
  | 'deferred' 
  | 'delegated';

export type ContributorRole = 
  | 'lead' 
  | 'developer' 
  | 'designer' 
  | 'analyst' 
  | 'reviewer' 
  | 'tester' 
  | 'consultant';

export type DependencyType = 
  | 'finish_to_start' 
  | 'start_to_start' 
  | 'finish_to_finish' 
  | 'start_to_finish';

export type DependencyStatus = 
  | 'active' 
  | 'resolved' 
  | 'blocked' 
  | 'cancelled';

export type BlockerType = 
  | 'resource' 
  | 'technical' 
  | 'approval' 
  | 'external' 
  | 'dependency' 
  | 'budget';

export type BlockerSeverity = 'critical' | 'high' | 'medium' | 'low';

export type BlockerStatus = 
  | 'open' 
  | 'in_progress' 
  | 'resolved' 
  | 'escalated' 
  | 'cancelled';

export type AttachmentCategory = 
  | 'specification' 
  | 'design' 
  | 'code' 
  | 'test_result' 
  | 'documentation' 
  | 'evidence' 
  | 'other';

export type DocumentationType = 
  | 'specification' 
  | 'user_guide' 
  | 'technical_doc' 
  | 'test_plan' 
  | 'deployment_guide' 
  | 'training_material';

export type DocumentationStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'published' 
  | 'archived';

export type EvidenceType = 
  | 'screenshot' 
  | 'test_result' 
  | 'document' 
  | 'video' 
  | 'log_file' 
  | 'measurement';

export type ActionStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'teams' | 'slack';

export type NotificationTiming = 
  | 'immediate' 
  | 'daily_digest' 
  | 'weekly_digest' 
  | 'on_deadline';

// Interfaces para análisis y reportes
export interface DeliverableMetrics {
  totalDeliverables: number;
  deliverablesByStatus: Record<DeliverableStatus, number>;
  deliverablesByPriority: Record<DeliverablePriority, number>;
  deliverablesByType: Record<DeliverableType, number>;
  
  // Métricas de calidad
  averageQualityScore: number;
  qualityTrend: QualityTrend;
  
  // Métricas de tiempo
  onTimeDeliveryRate: number;
  averageDelayDays: number;
  
  // Métricas de aprobación
  averageApprovalTime: number;
  approvalSuccessRate: number;
  
  // Métricas de defectos
  averageDefectsPerDeliverable: number;
  defectResolutionRate: number;
  
  // Comparación IMEVI
  imeviComparison: ImeviDeliverableComparison;
}

export interface ImeviDeliverableComparison {
  tracking: {
    imevi: string;
    novaproject: string;
    improvement: string;
  };
  quality: {
    imevi: string;
    novaproject: string;
    improvement: string;
  };
  approval: {
    imevi: string;
    novaproject: string;
    improvement: string;
  };
  roi: {
    costReduction: number;
    timeReduction: number;
    qualityIncrease: number;
  };
}

export interface DeliverableReport {
  id: string;
  reportType: DeliverableReportType;
  generatedAt: Date;
  generatedBy: string;
  
  // Período
  periodStart: Date;
  periodEnd: Date;
  
  // Métricas incluidas
  metrics: DeliverableMetrics;
  
  // Deliverables destacados
  topPerformingDeliverables: Deliverable[];
  delayedDeliverables: Deliverable[];
  qualityIssues: Deliverable[];
  
  // Recomendaciones
  recommendations: DeliverableRecommendation[];
  
  // Comparación IMEVI
  imeviAnalysis: ImeviDeliverableComparison;
}

export interface DeliverableRecommendation {
  id: string;
  type: RecommendationType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  estimatedEffort: number;
  targetDeliverables?: string[];
}

export type DeliverableReportType = 
  | 'executive_summary' 
  | 'quality_analysis' 
  | 'timeline_analysis' 
  | 'approval_efficiency' 
  | 'imevi_comparison';

export type RecommendationType = 
  | 'process_improvement' 
  | 'quality_enhancement' 
  | 'timeline_optimization' 
  | 'approval_streamlining' 
  | 'resource_allocation';
