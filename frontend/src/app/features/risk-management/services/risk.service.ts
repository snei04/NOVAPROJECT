import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Risk, EscalationEvent } from '../models/risk.model';

// Re-export for compatibility
export { Risk, EscalationEvent };

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/api/risks`;

  // Signals for local state
  private _risks = signal<Risk[]>([]);
  private _escalations = signal<EscalationEvent[]>([]);

  readonly allRisks = computed(() => this._risks());
  readonly recentEscalations = computed(() => this._escalations());

  getAllRisks(): Risk[] {
    return this._risks();
  }

  getRecentEscalations(): EscalationEvent[] {
    return this._escalations();
  }

  getRiskById(id: string): Risk | undefined {
    return this._risks().find(r => r.id === id);
  }

  async refreshData() {
    // Mock data loading
    if (this._risks().length === 0) {
        this._risks.set(this.getMockRisks());
    }
    if (this._escalations().length === 0) {
        this._escalations.set(this.getMockEscalations());
    }
  }

  async checkEscalationRules() {
    console.log('Checking escalation rules...');
    // Simulate rule checking
  }

  // API methods
  getRisksByProject(projectId: string | number): Observable<Risk[]> {
    return this.http.get<Risk[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createRisk(risk: Partial<Risk>): Observable<Risk> {
    return this.http.post<Risk>(this.apiUrl, risk);
  }

  updateRisk(id: number | string, risk: Partial<Risk>): Observable<Risk> {
    return this.http.put<Risk>(`${this.apiUrl}/${id}`, risk);
  }

  deleteRisk(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private getMockRisks(): Risk[] {
    const now = new Date();
    return [
      {
        id: 'r1',
        projectId: 'p1',
        title: 'Retraso en integración API',
        description: 'La API de terceros no responde a tiempo',
        category: 'technical',
        probability: 4,
        impact: 5,
        severity: 20,
        riskScore: 20,
        status: 'active',
        strategy: 'mitigate',
        owner: 'u1',
        ownerName: 'Carlos Tech Lead',
        identifiedBy: 'u2',
        identifiedAt: now,
        createdAt: now,
        updatedAt: now,
        escalationLevel: 2,
        isEscalated: true
      },
      {
        id: 'r2',
        projectId: 'p1',
        title: 'Presupuesto excedido',
        description: 'Costos de servidor más altos de lo previsto',
        category: 'budget',
        probability: 3,
        impact: 4,
        severity: 12,
        riskScore: 12,
        status: 'identified',
        strategy: 'accept',
        owner: 'u3',
        ownerName: 'Maria PM',
        identifiedBy: 'u3',
        identifiedAt: now,
        createdAt: now,
        updatedAt: now,
        escalationLevel: 0,
        isEscalated: false
      },
      {
        id: 'r3',
        projectId: 'p1',
        title: 'Baja disponibilidad del equipo',
        description: 'Vacaciones coincidentes en sprint crítico',
        category: 'resource',
        probability: 5,
        impact: 3,
        severity: 15,
        riskScore: 15,
        status: 'active',
        strategy: 'avoid',
        owner: 'u3',
        ownerName: 'Maria PM',
        identifiedBy: 'u3',
        identifiedAt: now,
        createdAt: now,
        updatedAt: now,
        escalationLevel: 1,
        isEscalated: false
      }
    ];
  }

  private getMockEscalations(): EscalationEvent[] {
    const now = new Date();
    return [
      {
        id: 'e1',
        riskId: 'r1',
        level: 2,
        triggeredBy: { type: 'score_increase', threshold: 15, description: 'Score > 15' },
        triggeredAt: new Date(now.getTime() - 3600000 * 2), // 2 hours ago
        status: 'triggered',
        escalatedTo: ['CTO', 'Project Manager'],
        notificationsSent: [
            { id: 'n1', channel: 'email', recipient: 'cto@example.com', sentAt: now, delivered: true },
            { id: 'n2', channel: 'slack', recipient: '#alerts', sentAt: now, delivered: true }
        ]
      },
      {
        id: 'e2',
        riskId: 'r3',
        level: 1,
        triggeredBy: { type: 'manual', description: 'Manual escalation' },
        triggeredAt: new Date(now.getTime() - 3600000 * 24), // 1 day ago
        status: 'acknowledged',
        escalatedTo: ['Project Manager'],
        notificationsSent: [],
        acknowledgedBy: 'Maria PM',
        acknowledgedAt: new Date(now.getTime() - 3600000 * 20)
      }
    ];
  }
}
