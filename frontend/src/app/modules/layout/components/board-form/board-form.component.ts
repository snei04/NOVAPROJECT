import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- NUEVO
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms'; // <-- NUEVO

import { BoardsService } from '@services/boards.service';
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
    private router: Router
  ) { }

  doSave() {
    if (this.form.valid) {
      const { title, backgroundColor } = this.form.getRawValue();
      this.boardService.createBoard(title, backgroundColor)
      .subscribe(board => {
        this.closeOverlay.next(false);
        this.router.navigate(['/app/boards', board.id]);
      })
    } else {
      this.form.markAllAsTouched();
    }
  }

}
