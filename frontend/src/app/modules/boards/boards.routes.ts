import { Routes } from '@angular/router';

import { BoardsComponent } from './pages/boards/boards.component';
import { BoardComponent } from './pages/board/board.component';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    component: BoardsComponent
  },
  {
    path: ':boardId',
    component: BoardComponent
  },
];