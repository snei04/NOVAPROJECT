import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Stakeholder {
  id?: string;
  projectId: string;
  name: string;
  role: string;
  priority: 'low' | 'medium' | 'high';
  contactInfo?: { email?: string; phone?: string; isSystemUser?: boolean; userId?: number };
}

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {
  private apiUrl = `${environment.API_URL}/api/stakeholders`;

  constructor(private http: HttpClient) {}

  // Obtener todos los stakeholders (de todos los proyectos visibles)
  getAllStakeholders(): Observable<Stakeholder[]> {
    return this.http.get<Stakeholder[]>(this.apiUrl);
  }

  // Obtener stakeholders por proyecto
  getStakeholdersByProject(projectId: string): Observable<Stakeholder[]> {
    return this.http.get<Stakeholder[]>(`${this.apiUrl}/project/${projectId}`);
  }

  // Crear un stakeholder
  createStakeholder(stakeholder: Partial<Stakeholder>): Observable<Stakeholder> {
    return this.http.post<Stakeholder>(this.apiUrl, stakeholder);
  }

  // Obtener disponibilidad
  getAvailability(stakeholderId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${stakeholderId}/availability`);
  }
}
