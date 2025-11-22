import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Deliverable {
  id?: number;
  project_id?: number;
  projectId?: number;
  title: string;
  description?: string;
  due_date?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'in_review' | 'approved' | 'rejected';
  type: 'document' | 'code' | 'design' | 'report' | 'other';
  progress: number; // 0-100
  evidence_link?: string;
  evidenceLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliverableService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/api/deliverables`;

  getByProject(projectId: string | number): Observable<Deliverable[]> {
    return this.http.get<Deliverable[]>(`${this.apiUrl}/project/${projectId}`);
  }

  create(data: Partial<Deliverable>): Observable<Deliverable> {
    return this.http.post<Deliverable>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Deliverable>): Observable<Deliverable> {
    return this.http.put<Deliverable>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
