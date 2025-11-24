import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Board } from '@models/board.model';
import { BoardsService } from '@services/boards.service';

@Component({
  selector: 'app-board-settings-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board-settings-dialog.component.html'
})
export class BoardSettingsDialogComponent {
  board: Board;
  activeTab: 'general' | 'governance' | 'finance' = 'general';
  isSaving = false;

  constructor(
    private dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: { board: Board },
    private boardsService: BoardsService
  ) {
    this.board = { ...data.board }; // Clone to avoid direct mutation
    // Ensure arrays exist
    if (!this.board.specificObjectives) {
        this.board.specificObjectives = [];
    }
  }

  save() {
    this.isSaving = true;
    // Extract fields to update
    const updates: any = {
        title: this.board.title,
        backgroundColor: this.board.backgroundColor,
        generalObjective: this.board.generalObjective,
        scopeDefinition: this.board.scopeDefinition,
        specificObjectives: this.board.specificObjectives,
        budgetEstimated: this.board.budgetEstimated,
        budgetActual: this.board.budgetActual,
        projectBenefit: this.board.projectBenefit
    };

    this.boardsService.update(this.board.id, updates).subscribe({
        next: () => {
            this.isSaving = false;
            this.dialogRef.close(true); // Return true to reload board
        },
        error: (err) => {
            console.error(err);
            this.isSaving = false;
            alert('Error al actualizar el tablero');
        }
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  addSpecificObjective() {
      if (!this.board.specificObjectives) this.board.specificObjectives = [];
      this.board.specificObjectives.push({ content: '' });
  }

  removeSpecificObjective(index: number) {
      this.board.specificObjectives?.splice(index, 1);
  }
  
  calculateVariance(): number {
      const est = Number(this.board.budgetEstimated) || 0;
      const act = Number(this.board.budgetActual) || 0;
      return est - act;
  }
  
  calculateROI(): number {
      const act = Number(this.board.budgetActual) || 0;
      const benefit = Number(this.board.projectBenefit) || 0;
      
      if (act === 0) return 0;
      return ((benefit - act) / act) * 100;
  }
}
