import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Milestone {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  targetDate: Date | string; // Changed from dueDate to match backend
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
    return this.http.get<any>(`${this.apiUrl}/project/${projectId}`)
      .pipe(map(response => response.data));
  }

  createMilestone(milestone: Milestone): Observable<Milestone> {
    return this.http.post<any>(this.apiUrl, milestone)
      .pipe(map(response => response.data));
  }

  updateMilestone(id: string, milestone: Partial<Milestone>): Observable<Milestone> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, milestone)
      .pipe(map(response => response.data));
  }

  deleteMilestone(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getProjectMetrics(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics/${projectId}`)
      .pipe(map(response => response.data));
  }
}
