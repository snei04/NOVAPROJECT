import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardsService } from '../../services/boards.service';
import { DeliverableService, Deliverable } from './services/deliverable.service';

@Component({
  selector: 'app-deliverable-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deliverable-tracker.component.html'
})
export class DeliverableTrackerComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private deliverableService = inject(DeliverableService);

  projects: any[] = [];
  selectedProject: any = null;
  deliverables: Deliverable[] = [];

  // Modal
  showModal = false;
  isSaving = false;
  newItem: Partial<Deliverable> = {
    title: '',
    progress: 0,
    status: 'pending',
    type: 'document',
    evidenceLink: ''
  };

  // Stats
  get total() { return this.deliverables.length; }
  get approvedCount() { return this.deliverables.filter(d => d.status === 'approved').length; }
  get inProgressCount() { return this.deliverables.filter(d => d.status === 'in_progress').length; }
  get overdueCount() { return this.deliverables.filter(d => this.isOverdue(d)).length; }

  ngOnInit() {
    this.boardsService.loadBoards().subscribe(boards => {
      this.projects = boards;
      if(boards.length > 0) this.selectProject(boards[0]);
    });
  }

  selectProject(project: any) {
    this.selectedProject = project;
    this.loadDeliverables();
  }

  loadDeliverables() {
    if(!this.selectedProject) return;
    this.deliverableService.getByProject(this.selectedProject.id).subscribe(data => {
      this.deliverables = data;
    });
  }

  openModal(item?: Deliverable) {
    if (item) {
       this.newItem = { ...item };
    } else {
       this.newItem = {
         projectId: this.selectedProject.id,
         title: '',
         progress: 0,
         status: 'pending',
         type: 'document',
         evidenceLink: ''
       };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newItem = {};
  }

  save() {
    if(!this.newItem.title || !this.newItem.dueDate) {
      alert('Título y Fecha límite son requeridos');
      return;
    }
    
    this.isSaving = true;
    
    if (this.newItem.id) {
        // Update
        this.deliverableService.update(this.newItem.id, this.newItem).subscribe({
            next: (updated) => {
                const index = this.deliverables.findIndex(d => d.id === updated.id);
                if (index !== -1) this.deliverables[index] = updated;
                this.closeModal();
                this.isSaving = false;
            },
            error: () => this.isSaving = false
        });
    } else {
        // Create
        this.newItem.projectId = this.selectedProject.id;
        this.deliverableService.create(this.newItem).subscribe({
            next: (created) => {
                this.deliverables.push(created);
                this.closeModal();
                this.isSaving = false;
            },
            error: () => this.isSaving = false
        });
    }
  }

  delete(item: Deliverable) {
    if(!confirm('¿Borrar este entregable?')) return;
    if(item.id) {
        this.deliverableService.delete(item.id).subscribe(() => {
            this.deliverables = this.deliverables.filter(d => d.id !== item.id);
        });
    }
  }

  updateProgress(item: Deliverable, newProgress: number) {
      if (!item.id) return;
      // Optimistic update
      item.progress = newProgress;
      this.deliverableService.update(item.id, { progress: newProgress }).subscribe();
  }

  updateStatus(item: Deliverable, newStatus: any) {
      if (!item.id) return;
      item.status = newStatus;
      this.deliverableService.update(item.id, { status: newStatus }).subscribe();
  }

  isOverdue(d: Deliverable): boolean {
     if(d.status === 'approved') return false;
     const dateStr = d.dueDate || d.due_date;
     if (!dateStr) return false;
     const due = new Date(dateStr);
     return due < new Date();
  }

  getTypeIcon(type: string): string {
      switch(type) {
          case 'code': return '💻';
          case 'design': return '🎨';
          case 'report': return '📄';
          default: return '📝';
      }
  }
}
