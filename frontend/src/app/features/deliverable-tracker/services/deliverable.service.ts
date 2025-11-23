import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Deliverable as EnhancedDeliverable } from '../models/deliverable.model';

export interface Deliverable {
  id?: number | string;
  project_id?: number;
  projectId?: number;
  title: string;
  description?: string;
  due_date?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'in_review' | 'approved' | 'rejected' | string;
  type: 'document' | 'code' | 'design' | 'report' | 'other' | string;
  progress: number; // 0-100
  evidence_link?: string;
  evidenceLink?: string;
  qualityScore?: number;
  approvalWorkflow?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DeliverableService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/api/deliverables`;

  // Signals for the new enhanced components
  private _enhancedDeliverables = signal<EnhancedDeliverable[]>([]);
  
  readonly totalDeliverables = computed(() => this._enhancedDeliverables().length);
  readonly averageQualityScore = computed(() => {
    const list = this._enhancedDeliverables();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + (curr.qualityScore || 0), 0);
    return Math.round(sum / list.length);
  });

  getAllDeliverables(): EnhancedDeliverable[] {
    return this._enhancedDeliverables();
  }

  async refreshData() {
    // In a real implementation, this would fetch from the API
    // For now, we'll populate with some mock data if empty to satisfy the UI
    if (this._enhancedDeliverables().length === 0) {
      this._enhancedDeliverables.set(this.getMockDeliverables());
    }
  }

  getByProject(projectId: string | number): Observable<Deliverable[]> {
    return this.http.get<Deliverable[]>(`${this.apiUrl}/project/${projectId}`);
  }

  create(data: Partial<Deliverable>): Observable<Deliverable> {
    return this.http.post<Deliverable>(this.apiUrl, data);
  }

  update(id: number | string, data: Partial<Deliverable>): Observable<Deliverable> {
    return this.http.put<Deliverable>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private getMockDeliverables(): EnhancedDeliverable[] {
     const now = new Date();
     return [
       {
         id: '1',
         title: 'Documentación de API v2',
         description: 'Especificación OpenAPI completa para la nueva versión',
         type: 'document',
         category: 'documentation',
         status: 'approval',
         progress: 95,
         priority: 'high',
         owner: 'u1',
         ownerName: 'Ana García',
         team: 'Backend',
         contributors: [],
         acceptanceCriteria: [],
         qualityMetrics: {
             completeness: 100,
             timeliness: 90,
             accuracy: 95,
             compliance: 100,
             defectsFound: 2,
             defectsResolved: 2,
             reviewCycles: 1,
             reworkHours: 4,
             overallScore: 92,
             qualityTrend: 'improving',
             lastCalculated: now,
             deliverableId: '1'
         },
         qualityScore: 92,
         approvalWorkflow: {
           id: 'w1',
           deliverableId: '1',
           requiredApprovers: [
             { 
                 level: 1, 
                 name: 'Tech Lead', 
                 description: 'Revisión Técnica', 
                 requiredApprovers: [{
                     userId: 'u2', 
                     userName: 'Carlos CTO', 
                     role: 'technical_lead', 
                     isRequired: true, 
                     canDelegate: true, 
                     email: 'carlos@example.com',
                     notificationPreferences: []
                 }], 
                 minimumApprovals: 1, 
                 allowDelegation: true, 
                 timeoutDays: 2, 
                 isOptional: false, 
                 specificCriteria: [] 
             },
             { 
                 level: 2, 
                 name: 'Product Owner', 
                 description: 'Aprobación de Negocio', 
                 requiredApprovers: [{
                     userId: 'u3', 
                     userName: 'María PO', 
                     role: 'project_manager', 
                     isRequired: true, 
                     canDelegate: false, 
                     email: 'maria@example.com',
                     notificationPreferences: []
                 }], 
                 minimumApprovals: 1, 
                 allowDelegation: false, 
                 timeoutDays: 3, 
                 isOptional: false, 
                 specificCriteria: [] 
             }
           ],
           isSequential: true,
           currentLevel: 1,
           overallStatus: 'in_progress',
           approvalHistory: [],
           autoAdvance: true,
           reminderFrequency: 1,
           escalationDelay: 2,
           createdAt: now,
           updatedAt: now
         },
         dependencies: [],
         blockers: [],
         attachments: [],
         documentation: [],
         createdAt: now,
         updatedAt: now,
         createdBy: 'u1',
         lastModifiedBy: 'u1',
         tags: ['api', 'backend'],
         estimatedHours: 10,
         plannedStartDate: now,
         plannedEndDate: now
       },
       {
         id: '2',
         title: 'Módulo de Autenticación',
         description: 'Implementación de OAuth2 y JWT',
         type: 'software',
         category: 'development',
         status: 'review',
         progress: 80,
         priority: 'critical',
         owner: 'u4',
         ownerName: 'Dev Team',
         team: 'Security',
         contributors: [],
         acceptanceCriteria: [],
         qualityMetrics: {
             completeness: 85,
             timeliness: 80,
             accuracy: 90,
             compliance: 95,
             defectsFound: 5,
             defectsResolved: 4,
             reviewCycles: 2,
             reworkHours: 8,
             overallScore: 88,
             qualityTrend: 'stable',
             lastCalculated: now,
             deliverableId: '2'
         },
         qualityScore: 88,
         approvalWorkflow: {
           id: 'w2',
           deliverableId: '2',
           requiredApprovers: [],
           isSequential: true,
           currentLevel: 0,
           overallStatus: 'not_started',
           approvalHistory: [],
           autoAdvance: true,
           reminderFrequency: 1,
           escalationDelay: 2,
           createdAt: now,
           updatedAt: now
         },
         dependencies: [],
         blockers: [],
         attachments: [],
         documentation: [],
         createdAt: now,
         updatedAt: now,
         createdBy: 'u1',
         lastModifiedBy: 'u1',
         tags: ['security', 'auth'],
         estimatedHours: 40,
         plannedStartDate: now,
         plannedEndDate: now
       }
     ] as unknown as EnhancedDeliverable[];
  }
}
