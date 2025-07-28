import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { ToastrService } from 'ngx-toastr';
import { faClock } from '@fortawesome/free-solid-svg-icons';

import { TodoDialogComponent } from '@boards/components/todo-dialog/todo-dialog.component';
import { BoardsService } from '@services/boards.service';
import { CardsService } from '@services/cards.service';
import { ListsService } from '@services/lists.service';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { List } from '@models/list.model';
import { Activity } from '@models/activity.model';
import { BACKGROUNDS } from '@models/colors.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drag-animating {
        transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board | null = null;
  activities: Activity[] = [];
  inputCard = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  inputList = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  showListForm = false;
  colorBackgrounds = BACKGROUNDS;
  faClock = faClock;

  inviteMemberForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  isInvitingMember = false;

  constructor(
    private dialog: Dialog,
    private route: ActivatedRoute,
    private boardsService: BoardsService,
    private cardsService: CardsService,
    private listsService: ListsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('boardId');
      if (id) {
        this.getBoard(id);
        this.getActivities(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.boardsService.setBackgroundColor('sky');
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    const position = this.boardsService.getPosition(event.container.data, event.currentIndex);
    const card = event.container.data[event.currentIndex];
    const listId = event.container.id;
    this.updateCard(card, position, listId);
  }

  addList() {
    const title = this.inputList.value;
    if (this.board) {
      this.listsService.create({ title, boardId: this.board.id, position: this.boardsService.getPositionNewItem(this.board.lists) })
        .subscribe(list => {
          this.board?.lists.push({ ...list, cards: [] });
          this.showListForm = false;
          this.inputList.setValue('');
        });
    }
  }

  openDialog(card: Card) {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      minWidth: '300px',
      maxWidth: '50%',
      data: {
        card: card,
        boardId: this.board?.id,
        userRole: this.board?.userRole,
        boardMembers: this.board?.members
      },
    });
    dialogRef.closed.subscribe((result) => {
    // Si el diálogo se cierra con un resultado 'true' (o cualquier resultado),
    // recargamos toda la información del tablero.
    if (result) {
        this.getBoard(this.board!.id);
    }
  });
}

  private getBoard(id: string) {
    this.boardsService.getBoard(id).subscribe(board => {
      this.board = board;
      this.boardsService.setBackgroundColor(this.board.backgroundColor);
    });
  }

  private updateCard(card: Card, position: number, listId: string | number) {
    this.cardsService.update(card.id, { position, listId }).subscribe(() => {
      if (this.board) {
        this.getActivities(this.board.id);
      }
    });
  }

  openFormCard(list: List) {
    if (this.board?.lists) {
      this.board.lists = this.board.lists.map(iteratorList => ({
        ...iteratorList,
        showCardForm: iteratorList.id === list.id
      }));
    }
  }

  createCard(list: List) {
    const title = this.inputCard.value;
    if (this.board) {
      this.cardsService.create({ title, listId: list.id, boardId: this.board.id, position: this.boardsService.getPositionNewItem(list.cards), labels: [], assignees: [] })
        .subscribe(card => {
          list.cards.push({ ...card, labels: [], assignees: [] });
          this.inputCard.setValue('');
          list.showCardForm = false;
        });
    }
  }

  closeCardForm(list: List) {
    list.showCardForm = false;
  }

 renameBoard(board: Board) {
    const newTitle = prompt('Nuevo nombre del tablero:', board.title);
    if (newTitle && newTitle !== board.title) {
      this.boardsService.update(board.id, { title: newTitle })
        .subscribe(() => {
          if (this.board) {
            this.board.title = newTitle;
          }
          this.toastr.success('Tablero renombrado');
        });
    }
  }

  deleteBoard(board: Board) {
    if (confirm(`¿Estás seguro de eliminar el tablero "${board.title}"? Esta acción no se puede deshacer.`)) {
      this.boardsService.delete(board.id)
        .subscribe(() => {
          this.toastr.success('Tablero eliminado');
          this.router.navigate(['/app/boards']);
        });
    }
  }

  renameList(list: List) {
    const newTitle = prompt('Nuevo nombre de la lista:', list.title);
    if (newTitle && newTitle !== list.title) {
      this.listsService.update(list.id, { title: newTitle })
        .subscribe(() => {
          list.title = newTitle;
          this.toastr.success('Lista renombrada');
        });
    }
  }

  deleteList(list: List) {
    if (confirm(`¿Estás seguro de eliminar la lista "${list.title}"?`)) {
      this.listsService.delete(list.id)
        .subscribe(() => {
          if (this.board) {
            const listIndex = this.board.lists.findIndex(item => item.id === list.id);
            if (listIndex !== -1) {
              this.board.lists.splice(listIndex, 1);
            }
          }
          this.toastr.success('Lista eliminada');
        });
    }
  }

  get colors() {
    if (this.board) {
      const classes = this.colorBackgrounds[this.board.backgroundColor];
      return classes ? classes : {};
    }
    return {};
  }

  private getActivities(id: string) {
    this.boardsService.getActivity(id).subscribe(activities => {
      this.activities = activities;
    });
  }

  inviteMember() {
    if (this.inviteMemberForm.valid && this.board) {
      this.isInvitingMember = true;
      const { email } = this.inviteMemberForm.getRawValue();
      this.boardsService.addMember(this.board.id, email).subscribe({
        next: () => {
          this.isInvitingMember = false;
          this.toastr.success('Usuario invitado exitosamente');
          this.getBoard(this.board!.id);
          this.inviteMemberForm.reset();
        },
        error: (err) => {
          this.isInvitingMember = false;
          this.toastr.error(err.error.message || 'Error al invitar al usuario');
        }
      });
    }
  }
}