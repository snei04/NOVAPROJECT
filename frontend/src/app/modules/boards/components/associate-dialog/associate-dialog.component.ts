import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { MeService } from '@services/me.service';
import { BoardsService } from '@services/boards.service';
import { Board } from '@models/board.model';
import { ToastrService } from 'ngx-toastr';

interface InputData {
  currentBoardId: string;
}

@Component({
  selector: 'app-associate-dialog',
  templateUrl: './associate-dialog.component.html',
})
export class AssociateDialogComponent implements OnInit {
  
  allMyBoards: Board[] = [];
  currentBoardId: string;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) data: InputData,
    private meService: MeService,
    private boardsService: BoardsService,
    private toastr: ToastrService
  ) {
    this.currentBoardId = data.currentBoardId;
  }

  ngOnInit(): void {
    this.meService.getMeBoards().subscribe(boards => {
      // Filtramos para no mostrar el tablero actual en la lista de opciones
      this.allMyBoards = [...boards.owned, ...boards.member]
        .filter(board => board.id !== this.currentBoardId);
    });
  }

  associateBoard(boardToAssociate: Board) {
    this.boardsService.createAssociation(this.currentBoardId, boardToAssociate.id)
      .subscribe({
        next: () => {
          this.toastr.success(`Tablero "${boardToAssociate.title}" asociado exitosamente.`);
          this.dialogRef.close(true); // Cerramos y enviamos 'true' para recargar
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'No se pudo asociar el tablero.');
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}
