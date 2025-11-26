// src/app/core/services/stakeholder.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stakeholder } from '../models/stakeholder.model';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {
  private http = inject(HttpClient);
  
  getAllByBoard(boardId: string): Observable<Stakeholder[]> {
    const url = `/api/v1/${boardId}/stakeholders`;
    return this.http.get<Stakeholder[]>(url);
  }

  // AÑADE ESTE NUEVO MÉTODO
  createInterview(boardId: string, interviewData: any): Observable<any> {
    const url = `/api/v1/${boardId}/interviews`;
    return this.http.post(url, interviewData);
  }
}