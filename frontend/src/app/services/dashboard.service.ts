import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardData {
  progress: {
    percent: number;
    deliverables: { total: number; completed: number };
    trend: string;
  };
  timeline: any[];
  alerts: {
    criticalRisks: number;
    totalRisks: number;
  };
  weeklyReports: {
    total: number;
    lastReport: any;
    history: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/api/dashboard`;

  getDashboard(projectId: number): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/${projectId}`);
  }

  createWeeklyReport(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports`, data);
  }
}
