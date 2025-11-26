import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BoardsService } from '../../../../services/boards.service';
import { StakeholderService } from '../../../../services/stakeholder.service';
import { MilestoneService, Milestone } from '../../../../services/milestone.service';
import { Colors } from '../../../../models/colors.model';
import { forkJoin, switchMap, of, catchError } from 'rxjs';

interface StakeholderDraft {
  name: string;
  role: string;
  email: string;
  priority: 'low' | 'medium' | 'high';
}

interface MilestoneDraft {
  title: string;
  dueDate: string;
  description: string;
}

@Component({
  selector: 'app-create-project-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-project-wizard.component.html',
  styleUrls: ['./create-project-wizard.component.scss']
})
export class CreateProjectWizardComponent {
  currentStep = 1;
  totalSteps = 3;
  isLoading = false;

  // Paso 1: Proyecto y Gobernanza
  projectData: { 
    title: string; 
    description: string; 
    backgroundColor: Colors;
    generalObjective: string;
    scopeDefinition: string;
    budgetEstimated: number;
  } = {
    title: '',
    description: '',
    backgroundColor: 'sky',
    generalObjective: '',
    scopeDefinition: '',
    budgetEstimated: 0
  };

  specificObjectives: string[] = [];
  newSpecificObjective = '';

  availableColors: Colors[] = [
    'sky',
    'green',
    'red',
    'yellow',
    'violet',
    'gray'
  ];

  // Paso 2: Stakeholders
  stakeholders: StakeholderDraft[] = [];
  newStakeholder: StakeholderDraft = { name: '', role: '', email: '', priority: 'medium' };

  // Paso 3: Métricas/Hitos
  milestones: MilestoneDraft[] = [];
  newMilestone: MilestoneDraft = { title: '', dueDate: '', description: '' };

  constructor(
    private boardsService: BoardsService,
    private stakeholderService: StakeholderService,
    private milestoneService: MilestoneService,
    private router: Router
  ) {}

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.currentStep === 1) {
         if (!this.projectData.title) {
            alert('Por favor asigna un nombre al proyecto');
            return;
         }
         if (!this.projectData.generalObjective || !this.projectData.scopeDefinition || this.specificObjectives.length === 0) {
             alert('Por favor completa los campos de gobernanza (Objetivo General, Alcance y al menos un Objetivo Específico) para continuar.');
             return;
         }
      }
      this.currentStep++;
    } else {
      this.finishWizard();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      // Si estamos en el paso 1, volver al dashboard principal
      this.router.navigate(['/app/project-dashboard']);
    }
  }

  // Métodos Gobernanza (Paso 1)
  addSpecificObjective() {
      if (this.newSpecificObjective.trim()) {
          this.specificObjectives.push(this.newSpecificObjective.trim());
          this.newSpecificObjective = '';
      }
  }

  removeSpecificObjective(index: number) {
      this.specificObjectives.splice(index, 1);
  }

  // Métodos Paso 2
  addStakeholder(): void {
    if (this.newStakeholder.name && this.newStakeholder.role) {
      this.stakeholders.push({ ...this.newStakeholder });
      this.newStakeholder = { name: '', role: '', email: '', priority: 'medium' };
    }
  }

  removeStakeholder(index: number): void {
    this.stakeholders.splice(index, 1);
  }

  // Métodos Paso 3
  addMilestone(): void {
    if (this.newMilestone.title && this.newMilestone.dueDate) {
      this.milestones.push({ ...this.newMilestone });
      this.newMilestone = { title: '', dueDate: '', description: '' };
    }
  }

  removeMilestone(index: number): void {
    this.milestones.splice(index, 1);
  }

  finishWizard(): void {
    this.isLoading = true;

    // 1. Crear Tablero (Proyecto)
    this.boardsService.createBoard(
      this.projectData.title,
      this.projectData.backgroundColor,
      this.projectData.generalObjective,
      this.projectData.scopeDefinition,
      this.specificObjectives.map(obj => ({ content: obj })),
      this.projectData.budgetEstimated
    ).pipe(
      switchMap((newBoard: any) => {
        const boardId = newBoard.id || newBoard.data?.id; // Ajustar según respuesta
        console.log('Tablero creado:', boardId);

        // Preparar llamadas paralelas para Stakeholders y Milestones
        const stakeholderCalls = this.stakeholders.map(s => 
          this.stakeholderService.createStakeholder({
            projectId: boardId,
            name: s.name,
            role: s.role,
            priority: s.priority,
            contactInfo: { email: s.email }
          }).pipe(catchError(e => of(null))) // Ignorar errores individuales
        );

        const milestoneCalls = this.milestones.map(m => 
          this.milestoneService.createMilestone({
            projectId: boardId,
            title: m.title,
            dueDate: new Date(m.dueDate),
            description: m.description,
            status: 'pending',
            priority: 'high'
          }).pipe(catchError(e => of(null)))
        );

        // Ejecutar todo junto - Si no hay llamadas, devolver array vacío
        const tasks = [of(newBoard)];
        if (stakeholderCalls.length) tasks.push(...stakeholderCalls);
        if (milestoneCalls.length) tasks.push(...milestoneCalls);

        return forkJoin(tasks);
      })
    ).subscribe({
      next: (results) => {
        this.isLoading = false;
        const newBoard: any = results[0]; 
        const boardId = newBoard.id || newBoard.data?.id;
        this.router.navigate(['/app/dashboard', boardId]);
      },
      error: (err) => {
        console.error('Error creando proyecto:', err);
        this.isLoading = false;
        const errorMsg = err.error?.message || err.message || 'Error desconocido';
        alert(`Hubo un error al crear el proyecto: ${errorMsg}`);
      }
    });
  }
}
