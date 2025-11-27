import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- NUEVO
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // <-- NUEVO
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms'; // <-- NUEVO
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop'; // <-- NUEVO
import { Dialog, DialogModule } from '@angular/cdk/dialog'; // <-- NUEVO
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from '@shared/components/button/button.component';
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
import { AssociateDialogComponent } from '@boards/components/associate-dialog/associate-dialog.component';
import { BoardSettingsDialogComponent } from '@boards/components/board-settings-dialog/board-settings-dialog.component';
import { InputDialogComponent } from '@boards/components/input-dialog/input-dialog.component';
import { ConfirmDialogComponent } from '@boards/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  standalone: true, 
  imports: [ 
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    DragDropModule,
    DialogModule,
    FontAwesomeModule,
    ButtonComponent
  ],
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
  associatedBoards: Board[] = [];
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
      this.boardsService.setCurrentBoardId(id);
      if (id) {
        this.getBoard(id);
        this.getActivities(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.boardsService.setCurrentBoardId(null);
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
        this.getActivities(this.board!.id);
    }
  });
}

openAssociateDialog() {
    if (!this.board) return;

    const dialogRef = this.dialog.open(AssociateDialogComponent, {
      data: {
        currentBoardId: this.board.id,
      },
    });

    dialogRef.closed.subscribe(result => {
      if (result) {
        this.getAssociatedBoards(this.board!.id); // Recargamos solo las asociaciones
      } 
    });
  }

  openSettingsDialog() {
    if (!this.board) return;

    const dialogRef = this.dialog.open(BoardSettingsDialogComponent, {
      minWidth: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        board: this.board
      }
    });

    dialogRef.closed.subscribe(result => {
        if (result) {
            this.getBoard(this.board!.id); // Reload board to see changes
        }
    });
  }

  private getBoard(id: string) {
    this.boardsService.getBoard(id).subscribe(board => {
      this.board = board;
      this.boardsService.setBackgroundColor(this.board.backgroundColor);
      this.getAssociatedBoards(id);
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
      this.cardsService.create({
        title, listId: list.id, boardId: this.board.id, position: this.boardsService.getPositionNewItem(list.cards), labels: [], assignees: [],
        isCompleted: false
      })
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
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: {
        title: 'Renombrar Tablero',
        initialValue: board.title,
        placeholder: 'Nuevo nombre'
      }
    });

    dialogRef.closed.subscribe((newTitle: any) => {
      if (newTitle && newTitle !== board.title) {
        this.boardsService.update(board.id, { title: newTitle })
          .subscribe(() => {
            if (this.board) {
              this.board.title = newTitle;
            }
            this.toastr.success('Tablero renombrado');
          });
      }
    });
  }

  deleteBoard(board: Board) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Tablero',
        message: `¿Estás seguro de eliminar el tablero "${board.title}"? Esta acción no se puede deshacer.`,
        color: 'danger',
        confirmText: 'Eliminar'
      }
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.boardsService.delete(board.id)
          .subscribe(() => {
            this.toastr.success('Tablero eliminado');
            this.router.navigate(['/app/boards']);
          });
      }
    });
  }

  renameList(list: List) {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: {
        title: 'Renombrar Lista',
        initialValue: list.title,
        placeholder: 'Nuevo nombre'
      }
    });

    dialogRef.closed.subscribe((newTitle: any) => {
      if (newTitle && newTitle !== list.title) {
        this.listsService.update(list.id, { title: newTitle })
          .subscribe(() => {
            list.title = newTitle;
            this.toastr.success('Lista renombrada');
          });
      }
    });
  }

  deleteList(list: List) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Lista',
        message: `¿Estás seguro de eliminar la lista "${list.title}"?`,
        color: 'danger',
        confirmText: 'Eliminar'
      }
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
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
    });
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

  private getAssociatedBoards(id: string) {
    this.boardsService.getAssociations(id).subscribe(boards => {
      this.associatedBoards = boards;
    });
  }

  inviteMember() {
    if (this.inviteMemberForm.valid && this.board) {
      this.isInvitingMember = true;
      const { email } = this.inviteMemberForm.getRawValue();
      this.boardsService.addMember(this.board.id, email).subscribe({
        next: (res: any) => {
          this.isInvitingMember = false;
          this.toastr.success(res.message || 'Usuario invitado exitosamente');
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

toggleCardCompletion(card: Card, currentListId: string | number) {
    const newStatus = !card.isCompleted;

    // Si se marca como completada y estamos en un tablero válido
    if (newStatus && this.board) {
      const completedList = this.board.lists.find(l => l.title === 'Completado');
      const currentList = this.board.lists.find(l => l.id === currentListId);

      // Si existe la lista "Completado", la lista actual, y no estamos ya en "Completado"
      if (completedList && currentList && completedList.id !== currentListId) {
        
        // 1. Llamada al backend para actualizar estado y mover de lista
        this.cardsService.update(card.id, { 
          isCompleted: true, 
          listId: completedList.id 
        }).subscribe({
          next: () => {
            // 2. Actualizar UI (Mover visualmente la tarjeta)
            const index = currentList.cards.findIndex(c => c.id === card.id);
            if (index > -1) {
              currentList.cards.splice(index, 1); // Quitar de lista actual
            }
            
            card.isCompleted = true;
            // card.listId no existe en la interfaz Card, usamos list si es necesario
            // card.list = completedList; // Opcional si la interfaz lo requiere
            completedList.cards.push(card); // Añadir a Completado

            this.toastr.success('Tarea movida a Completado');
            this.getActivities(this.board!.id);
          },
          error: () => {
            this.toastr.error('Error al mover la tarea');
            card.isCompleted = false; // Revertir check visualmente si falla
          }
        });
        return; // Terminamos aquí
      }
    }

    // Caso normal: Desmarcar o no existe lista "Completado" -> Solo actualizar estado
    this.cardsService.update(card.id, { isCompleted: newStatus })
      .subscribe({
        next: () => {
          card.isCompleted = newStatus;
          this.toastr.success('Estado actualizado');
        },
        error: () => {
          this.toastr.error('No se pudo actualizar la tarea');
          card.isCompleted = !newStatus; // Revertir
        }
      });
  }

}