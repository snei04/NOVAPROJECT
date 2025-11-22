import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Milestone {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: Date | string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  private apiUrl = `${environment.API_URL}/api/milestones`;

  constructor(private http: HttpClient) {}

  getMilestonesByProject(projectId: string): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createMilestone(milestone: Milestone): Observable<Milestone> {
    return this.http.post<Milestone>(this.apiUrl, milestone);
  }

  updateMilestone(id: string, milestone: Partial<Milestone>): Observable<Milestone> {
    return this.http.put<Milestone>(`${this.apiUrl}/${id}`, milestone);
  }

  deleteMilestone(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProjectMetrics(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics/${projectId}`);
  }
}
