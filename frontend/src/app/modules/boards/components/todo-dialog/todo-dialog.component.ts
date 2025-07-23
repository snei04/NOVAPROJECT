import { Component, Inject, OnInit } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormBuilder, FormControl } from '@angular/forms';
import { faClose, faCheckToSlot, faBars, faUser, faTag, faCheckSquare, faClock, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

import { Card } from '@models/card.model';
import { Label } from '@models/label.model';
import { User } from '@models/user.model';
import { CardsService } from '@services/cards.service';
import { LabelsService } from '@services/labels.service';

interface InputData {
  card: Card;
  boardId: string;
  userRole?: 'owner' | 'member';
  boardMembers: User[];
}

@Component({
  selector: 'app-todo-dialog',
  templateUrl: './todo-dialog.component.html',
})
export class TodoDialogComponent implements OnInit {
  // --- Iconos ---
  faClose = faClose;
  faCheckToSlot = faCheckToSlot;
  faBars = faBars;
  faUser = faUser;
  faTag = faTag;
  faCheckSquare = faCheckSquare;
  faClock = faClock;
  faPenToSquare = faPenToSquare;

  // --- Propiedades ---
  card: Card;
  boardId: string;
  userRole?: 'owner' | 'member';
  boardMembers: User[] = [];
  boardLabels: Label[] = [];
  
  // --- Estados de la UI ---
  isEditingDescription = false;
  isOpenLabels = false;
  isOpenMembers = false;
  editingLabelId: number | null = null;
  
  // --- Formularios ---
  descriptionInput = new FormControl('', { nonNullable: true });
  dueDateInput = new FormControl<string | null>(null);
  formLabel = this.formBuilder.nonNullable.group({ name: [''], color: ['red'] });
  formEditLabel = this.formBuilder.nonNullable.group({ name: [''], color: ['red'] });
  
  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) data: InputData,
    private cardsService: CardsService,
    private labelsService: LabelsService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.card = data.card;
    this.boardId = data.boardId;
    this.userRole = data.userRole;
    this.boardMembers = data.boardMembers;
  }

  ngOnInit(): void {
    this.descriptionInput.setValue(this.card.description || '');
    if (this.card.dueDate) {
      const date = new Date(this.card.dueDate);
      const formattedDate = date.toISOString().substring(0, 16);
      this.dueDateInput.setValue(formattedDate);
    }
    if (this.boardId) {
      this.getBoardLabels(this.boardId);
    }
  }

  close(result = false) {
    this.dialogRef.close(result);
  }

  saveDescription() {
    const newDescription = this.descriptionInput.value;
    this.cardsService.update(this.card.id, { description: newDescription }).subscribe(() => {
      this.card.description = newDescription;
      this.isEditingDescription = false;
      this.toastr.success('Descripción actualizada');
    });
  }
  
  saveDueDate() {
    if (this.dueDateInput.value) {
      const newDueDate = new Date(this.dueDateInput.value);
      this.cardsService.update(this.card.id, { dueDate: newDueDate }).subscribe(() => {
        this.card.dueDate = newDueDate;
        this.toastr.success('Fecha de vencimiento actualizada.');
      });
    }
  }

  getBoardLabels(boardId: string) {
    this.labelsService.getLabels(boardId).subscribe(labels => this.boardLabels = labels);
  }

  toggleLabel(label: Label) {
    if (this.isLabelAssigned(label.id)) {
      this.labelsService.removeLabel(this.card.id, label.id).subscribe(() => {
        this.card.labels = this.card.labels.filter(l => l.id !== label.id);
      });
    } else {
      this.labelsService.assignLabel(this.card.id, label.id).subscribe(() => {
        this.card.labels = [...this.card.labels, label];
      });
    }
  }

  createLabel() {
  if (this.formLabel.valid) {
    const { name, color } = this.formLabel.getRawValue();
    if (name && color) {
      this.labelsService.create(name, color, this.boardId).subscribe(() => {
        this.toastr.success('Etiqueta creada exitosamente');
        
        
        this.dialogRef.close(true); 
      });
    }
  }
}
  
  editLabel(label: Label) {
    this.editingLabelId = label.id;
    this.formEditLabel.setValue({ name: label.name, color: label.color });
  }

  saveLabelChanges() {
    if (this.formEditLabel.valid && this.editingLabelId) {
      const { name, color } = this.formEditLabel.getRawValue();
      this.labelsService.update(this.editingLabelId, { name, color }).subscribe(() => {
        const index = this.boardLabels.findIndex(l => l.id === this.editingLabelId);
        if (index !== -1) {
          this.boardLabels[index] = { ...this.boardLabels[index], name, color };
        }
        this.editingLabelId = null;
      });
    }
  }

  cancelEditLabel() {
    this.editingLabelId = null;
  }
  
  isLabelAssigned(labelId: number): boolean {
    return this.card.labels.some(label => label.id === labelId);
  }

  isMemberAssigned(memberId: string): boolean {
    return this.card.assignees.some(assignee => assignee.id === memberId);
  }
  
  toggleMember(member: User) {
    if (this.isMemberAssigned(member.id)) {
      this.cardsService.removeMember(this.card.id, member.id).subscribe(() => {
        this.card.assignees = this.card.assignees.filter(a => a.id !== member.id);
      });
    } else {
      this.cardsService.assignMember(this.card.id, member.id).subscribe(() => {
        this.card.assignees = [...this.card.assignees, member];
      });
    }
  }
}