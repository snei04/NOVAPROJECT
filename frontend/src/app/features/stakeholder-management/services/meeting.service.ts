import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Meeting {
  id?: string;
  projectId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  description?: string;
  actionItems?: ActionItem[];
}

export interface ActionItem {
  id: string;
  meetingId: string;
  description: string;
  assigneeId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = `${environment.API_URL}/api/meetings`; // Asumiendo que existe o se usa stakeholders route

  constructor(private http: HttpClient) {}

  getMeetingsByProject(projectId: string): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${environment.API_URL}/api/stakeholders/meetings/${projectId}`);
  }

  createMeeting(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(`${environment.API_URL}/api/stakeholders/meetings`, meeting);
  }

  updateMeetingStatus(id: string, status: string): Observable<Meeting> {
    return this.http.put<Meeting>(`${environment.API_URL}/api/stakeholders/meetings/${id}/status`, { status });
  }

  createActionItem(item: Partial<ActionItem>): Observable<ActionItem> {
    return this.http.post<ActionItem>(`${environment.API_URL}/api/stakeholders/action-items`, item);
  }

  updateActionItemStatus(id: string, status: string): Observable<void> {
    return this.http.put<void>(`${environment.API_URL}/api/stakeholders/action-items/${id}/status`, { status });
  }
}
