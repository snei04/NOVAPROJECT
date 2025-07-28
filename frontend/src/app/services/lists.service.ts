import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { checkToken } from '@interceptors/token.interceptor';
import { List, CreateListDto } from '@models/list.model';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  create(dto: CreateListDto) {
    return this.http.post<List>(`${this.apiUrl}/api/v1/lists`, dto, {
      context: checkToken()
    });
  }
  update(id: string, changes: { title?: string }) {
    return this.http.put(`${this.apiUrl}/api/v1/lists/${id}`, changes, { context: checkToken() });
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/api/v1/lists/${id}`, { context: checkToken() });
  }

}
