import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- NUEVO
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms'; // <-- NUEVO

import { BoardsService } from '@services/boards.service';
import { BoardInitializationService } from '@services/board-initialization.service';
import { Colors } from '@models/colors.model';
import { ButtonComponent } from '@shared/components/button/button.component'; // <-- NUEVO

@Component({
  selector: 'app-board-form',
  templateUrl: './board-form.component.html',
  standalone: true, // <-- AÑADIDO
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent], // <-- AÑADIDO
})
export class BoardFormComponent {

  @Output() closeOverlay = new EventEmitter<boolean>();

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    backgroundColor: new FormControl<Colors>('sky', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor(
    private formBuilder: FormBuilder,
    private boardService: BoardsService,
    private boardInitService: BoardInitializationService,
    private router: Router
  ) { }

  doSave() {
    if (this.form.valid) {
      const { title, backgroundColor } = this.form.getRawValue();
      
      // Usar el servicio de inicialización para crear tablero con contenido
      this.boardInitService.createBoardWithInitialContent(title, backgroundColor)
      .subscribe({
        next: (board) => {
          this.closeOverlay.next(false);
          this.router.navigate(['/app/boards', board.id]);
          console.log('✅ Tablero creado con contenido inicial:', board.title);
        },
        error: (error) => {
          console.error('❌ Error creando tablero:', error);
          // Fallback: crear tablero sin contenido inicial
          this.boardService.createBoard(title, backgroundColor)
          .subscribe(board => {
            this.closeOverlay.next(false);
            this.router.navigate(['/app/boards', board.id]);
            console.log('⚠️ Tablero creado sin contenido inicial (fallback)');
          });
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

}
