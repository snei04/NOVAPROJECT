import { List } from "./list.model";
import { Label } from './label.model'; 
import { User } from './user.model';


export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  list: List;
  labels: Label[];
  assignees: User[];
  dueDate?: string | Date;
}

// export interface CreateCardDto {
//   title: string;
//   position: number;
//   description?: string;
//   listId: string;
//   boardId: string;
// }

export interface CreateCardDto extends Omit<Card, 'id' | 'list'> {
  listId: string;
  boardId: string;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
  position?: number;
  listId?: string | number;
  boardId?: string;
  dueDate?: string | Date;
}
