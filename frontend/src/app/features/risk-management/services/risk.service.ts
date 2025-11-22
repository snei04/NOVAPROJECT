import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Risk {
  id?: number;
  project_id?: number;
  projectId?: number;
  title: string;
  description?: string;
  probability: number; // 1-5
  impact: number; // 1-5
  severity?: number; // Calculado
  status: 'identified' | 'assessed' | 'mitigated' | 'closed' | 'occurred';
  mitigation_plan?: string;
  mitigationPlan?: string;
  owner_id?: number;
  ownerId?: number;
  ownerName?: string;
  ownerAvatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/api/risks`;

  getRisksByProject(projectId: string | number): Observable<Risk[]> {
    return this.http.get<Risk[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createRisk(risk: Partial<Risk>): Observable<Risk> {
    return this.http.post<Risk>(this.apiUrl, risk);
  }

  updateRisk(id: number, risk: Partial<Risk>): Observable<Risk> {
    return this.http.put<Risk>(`${this.apiUrl}/${id}`, risk);
  }

  deleteRisk(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
