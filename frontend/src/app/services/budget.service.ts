import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { checkToken } from '@interceptors/token.interceptor';
import { Observable } from 'rxjs';

export interface BudgetItem {
  id: string;
  project_id: number;
  milestone_id?: string;
  milestone_title?: string;
  description: string;
  category: string;
  assigned_to?: number;
  amount_approved: number;
  amount_executed: number;
  justification?: string;
  created_at?: string;
}

export interface BudgetSummary {
  totalApproved: number;
  totalExecuted: number;
  remaining: number;
  executionPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) { }

  getBudgetItems(boardId: string): Observable<BudgetItem[]> {
    return this.http.get<BudgetItem[]>(`${this.apiUrl}/api/budget/project/${boardId}`, {
      context: checkToken()
    });
  }

  createBudgetItem(boardId: string, data: Partial<BudgetItem>): Observable<BudgetItem> {
    return this.http.post<BudgetItem>(`${this.apiUrl}/api/budget/project/${boardId}`, data, {
      context: checkToken()
    });
  }

  updateBudgetItem(id: string, data: Partial<BudgetItem>): Observable<BudgetItem> {
    return this.http.put<BudgetItem>(`${this.apiUrl}/api/budget/${id}`, data, {
      context: checkToken()
    });
  }

  deleteBudgetItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/budget/${id}`, {
      context: checkToken()
    });
  }

  getBudgetSummary(boardId: string): Observable<BudgetSummary> {
    return this.http.get<BudgetSummary>(`${this.apiUrl}/api/budget/project/${boardId}/summary`, {
      context: checkToken()
    });
  }
}
