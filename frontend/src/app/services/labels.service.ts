import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { checkToken } from '@interceptors/token.interceptor';
import { Label } from '@models/label.model';

@Injectable({
  providedIn: 'root'
})
export class LabelsService {
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient) { }
 getLabels(boardId: string) {
  // La URL correcta debe coincidir con la ruta del backend: /boards/:boardId/labels
  return this.http.get<Label[]>(`${this.apiUrl}/api/v1/boards/${boardId}/labels`, {
    context: checkToken(),
  });
}

  assignLabel(cardId: string, labelId: number) {
    return this.http.post(`${this.apiUrl}/api/v1/labels/assign`, { cardId, labelId }, {
      context: checkToken(),
    });
  }

  removeLabel(cardId: string, labelId: number) {
    return this.http.delete(`${this.apiUrl}/api/v1/labels/assign/${cardId}/${labelId}`, {
      context: checkToken(),
    });
  }
  create(name: string, color: string, boardId: string) {
    return this.http.post<Label>(`${this.apiUrl}/api/v1/labels`, { name, color, boardId }, {
      context: checkToken(),
    });
  }
  update(id: number, changes: { name?: string, color?: string }) {
    return this.http.put(`${this.apiUrl}/api/v1/labels/${id}`, changes, {
      context: checkToken(),
    });
  }
}

