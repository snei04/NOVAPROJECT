import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

interface InputDialogData {
  title: string;
  message?: string;
  initialValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FontAwesomeModule],
})
export class InputDialogComponent {
  faClose = faClose;
  input = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  constructor(
    private dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: InputDialogData
  ) {
    if (data.initialValue) {
      this.input.setValue(data.initialValue);
    }
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    if (this.input.valid) {
      this.dialogRef.close(this.input.value);
    }
  }
}
