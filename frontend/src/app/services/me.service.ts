import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { User } from '@models/user.model';
import { Board } from '@models/board.model';
import { checkToken } from '@interceptors/token.interceptor';

// Interfaz para la nueva estructura de la respuesta
export interface BoardsResponse {
  owned: Board[];
  member: Board[];
}

export interface MyTask {
  card_id: number;
  card_title: string;
  due_date: string | Date;
  list_title: string;
  board_id: number;
  board_title: string;
  backgroundColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class MeService {
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  getMeProfile() {
    return this.http.get<User>(`${this.apiUrl}/api/v1/me/profile`, {
      context: checkToken(),
    });
  }

  // El tipo de retorno ahora es BoardsResponse
  getMeBoards() {
    return this.http.get<BoardsResponse>(`${this.apiUrl}/api/v1/me/boards`, {
      context: checkToken(),
    });
  }
  getMyTasks() {
    return this.http.get<MyTask[]>(`${this.apiUrl}/api/v1/me/tasks`, {
      context: checkToken(),
    });
  }

 
  updateProfile(name: string) {
    return this.http.put(`${this.apiUrl}/api/v1/me/profile`, { name }, {
      context: checkToken(),
    });
  
}
}