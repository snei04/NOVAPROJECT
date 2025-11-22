import { Injectable, inject } from '@angular/core';
import { BoardsService } from './boards.service';
import { Board } from '@models/board.model';
import { Colors } from '@models/colors.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardInitializationService {
  private boardsService = inject(BoardsService);

  createBoardWithInitialContent(title: string, backgroundColor: string): Observable<Board> {
    return this.boardsService.createBoard(title, backgroundColor as Colors);
  }
}
