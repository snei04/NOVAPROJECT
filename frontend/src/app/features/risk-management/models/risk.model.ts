export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: RiskCategory;
  
  // Evaluación
  probability: number; // 1-5
  impact: number; // 1-5
  severity: number; // Calculated (prob * impact)
  riskScore: number; // 0-25 or 0-100
  
  // Estado
  status: RiskStatus;
  strategy: RiskStrategy;
  
  // Ownership
  owner: string;
  ownerName: string;
  identifiedBy: string;
  identifiedAt: Date;
  
  // Mitigación
  mitigationPlan?: string;
  contingencyPlan?: string;
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
  lastAssessedAt?: Date;
  
  // Escalation
  escalationLevel: number;
  isEscalated: boolean;
}

export interface EscalationEvent {
  id: string;
  riskId: string;
  level: number;
  
  // Trigger
  triggeredBy: EscalationTrigger;
  triggeredAt: Date;
  
  // Estado
  status: EscalationStatus;
  
  // Destinatarios
  escalatedTo: string[];
  notificationsSent: EscalationNotification[];
  
  // Resolución
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  response?: string;
  actionsTaken?: string[];
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface EscalationTrigger {
  type: 'score_increase' | 'overdue_control' | 'no_update' | 'manual';
  threshold?: number;
  timeframe?: number; // hours
  description?: string;
}

export interface EscalationNotification {
  id: string;
  channel: 'email' | 'sms' | 'push' | 'teams' | 'slack';
  recipient: string;
  sentAt: Date;
  delivered: boolean;
}

export type RiskCategory = 
  | 'technical' 
  | 'schedule' 
  | 'budget' 
  | 'resource' 
  | 'external' 
  | 'quality'
  | 'legal';

export type RiskStatus = 
  | 'identified' 
  | 'assessed' 
  | 'active'
  | 'mitigated' 
  | 'occurred' 
  | 'closed';

export type RiskStrategy = 
  | 'avoid' 
  | 'mitigate' 
  | 'transfer' 
  | 'accept';

export type EscalationStatus = 
  | 'triggered' 
  | 'acknowledged' 
  | 'in_progress' 
  | 'resolved' 
  | 'expired';
