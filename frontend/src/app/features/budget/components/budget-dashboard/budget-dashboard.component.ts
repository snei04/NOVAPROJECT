import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BudgetService, BudgetItem, BudgetSummary } from '@services/budget.service';
import { BoardsService } from '@services/boards.service';
import { MilestoneService, Milestone } from '@services/milestone.service';

@Component({
  selector: 'app-budget-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-start">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="text-3xl"></span>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Presupuesto</h1>
          </div>
          <p class="text-gray-600 dark:text-gray-400 italic">
            Relacione los recursos esenciales que son necesarios para llevar a cabo el proyecto con éxito
          </p>
        </div>

        <!-- Project Selector -->
        <div class="relative">
          <select 
            [ngModel]="selectedProject" 
            (ngModelChange)="selectProject($event)"
            class="appearance-none bg-white text-gray-800 font-bold py-2 pl-4 pr-10 rounded-lg shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all min-w-[220px] border border-gray-200">
            <option [ngValue]="null" disabled>Seleccionar Proyecto...</option>
            <option *ngFor="let p of projects" [ngValue]="p">{{ p.title }}</option>
          </select>
        </div>
      </div>

      <!-- Main Content (only if project selected) -->
      <div *ngIf="selectedProject">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" *ngIf="summary">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Presupuesto Aprobado</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ summary.totalApproved | currency:'USD':'symbol':'1.0-0' }}
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Ejecutado</div>
            <div class="text-2xl font-bold text-blue-600">
              {{ summary.totalExecuted | currency:'USD':'symbol':'1.0-0' }}
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Disponible</div>
            <div class="text-2xl font-bold" [class.text-green-600]="summary.remaining > 0" [class.text-red-600]="summary.remaining < 0">
              {{ summary.remaining | currency:'USD':'symbol':'1.0-0' }}
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">% Ejecución</div>
            <div class="flex items-center gap-2">
              <div class="text-2xl font-bold text-purple-600">
                {{ summary.executionPercentage | number:'1.0-1' }}%
              </div>
              <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-purple-600" [style.width.%]="summary.executionPercentage"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Budget Table -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <h2 class="font-bold text-gray-700 dark:text-gray-300">Detalle de Rubros</h2>
            <button *ngIf="selectedProject?.userRole !== 'viewer'" (click)="openModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <span>➕</span> Nuevo Item
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 w-12">#</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Descripción</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Fase / Milestone</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Categoría</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Presupuesto Aprobado</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Presupuesto Ejecutado</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Justificación Variaciones</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let item of budgetItems; let i = index" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <td class="px-6 py-4 text-gray-500">{{ i + 1 }}</td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900 dark:text-white">{{ item.description }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-medium" [ngClass]="item.milestone_title ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'">
                      {{ item.milestone_title || 'Sin Asignar' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      🏷️ {{ item.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                    {{ item.amount_approved | currency:'USD':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-6 py-4 text-right font-medium text-blue-600">
                    {{ item.amount_executed | currency:'USD':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-6 py-4 text-gray-500 italic">
                     {{ item.justification || '-' }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" *ngIf="selectedProject?.userRole !== 'viewer'">
                      <button (click)="editItem(item)" class="p-1 hover:bg-blue-100 rounded text-blue-600" title="Editar">✏️</button>
                      <button (click)="deleteItem(item.id)" class="p-1 hover:bg-red-100 rounded text-red-600" title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="budgetItems.length === 0">
                  <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    No hay items de presupuesto registrados.
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 dark:bg-gray-800 font-bold border-t border-gray-200 dark:border-gray-700">
                <tr>
                  <td colspan="4" class="px-6 py-4 text-right">TOTALES</td>
                  <td class="px-6 py-4 text-right">{{ summary?.totalApproved | currency:'USD':'symbol':'1.0-0' }}</td>
                  <td class="px-6 py-4 text-right text-blue-600">{{ summary?.totalExecuted | currency:'USD':'symbol':'1.0-0' }}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!selectedProject && projects.length > 0" class="text-center py-20">
        <div class="text-6xl mb-4">⬅️</div>
        <h3 class="text-xl font-bold text-gray-500">Selecciona un proyecto para ver su presupuesto</h3>
      </div>
    </div>

    <!-- Modal Form -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 dark:text-white">{{ editingItem ? 'Editar Item' : 'Nuevo Item de Presupuesto' }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
            <input [(ngModel)]="newItem.description" type="text" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Fase / Milestone</label>
            <select [(ngModel)]="newItem.milestone_id" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
              <option [ngValue]="null">-- Sin Asignar --</option>
              <option *ngFor="let m of milestones" [value]="m.id">{{ m.title }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
            <select [(ngModel)]="newItem.category" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
              <option value="Consultoría">Consultoría</option>
              <option value="Licencias">Licencias</option>
              <option value="Hardware">Hardware</option>
              <option value="Personal">Personal</option>
              <option value="Servicios Cloud">Servicios Cloud</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Aprobado ($)</label>
              <input [(ngModel)]="newItem.amount_approved" type="number" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Ejecutado ($)</label>
              <input [(ngModel)]="newItem.amount_executed" type="number" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Justificación Variaciones</label>
            <textarea [(ngModel)]="newItem.justification" rows="2" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button (click)="closeModal()" class="px-4 py-2 text-gray-500 hover:text-gray-700">Cancelar</button>
          <button (click)="saveItem()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>
  `
})
export class BudgetDashboardComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private boardsService = inject(BoardsService);
  private milestoneService = inject(MilestoneService);
  private route = inject(ActivatedRoute);

  projects: any[] = [];
  selectedProject: any = null;
  milestones: Milestone[] = [];
  
  boardId: string | null = null;
  budgetItems: BudgetItem[] = [];
  summary: BudgetSummary | null = null;

  showModal = false;
  editingItem: BudgetItem | null = null;
  newItem: Partial<BudgetItem> = {};

  ngOnInit() {
    // Load projects
    this.boardsService.loadBoards().subscribe(boards => {
      this.projects = boards;
      
      // Check for boardId param
      this.route.params.subscribe(params => {
        const routeBoardId = params['boardId'];
        if (routeBoardId) {
          const found = this.projects.find(p => p.id == routeBoardId);
          if (found) this.selectProject(found);
        } else if (this.projects.length > 0) {
            // Default to first
            this.selectProject(this.projects[0]);
        }
      });
    });
  }

  selectProject(project: any) {
    this.selectedProject = project;
    this.boardId = project.id;
    this.loadData();
    this.loadMilestones();
  }

  loadData() {
    if (!this.boardId) return;
    
    this.budgetService.getBudgetItems(this.boardId).subscribe(items => {
      this.budgetItems = items;
    });

    this.budgetService.getBudgetSummary(this.boardId).subscribe(summary => {
      this.summary = summary;
    });
  }

  loadMilestones() {
    if (!this.boardId) return;
    this.milestoneService.getMilestonesByProject(this.boardId).subscribe(milestones => {
        this.milestones = milestones;
    });
  }

  openModal() {
    this.editingItem = null;
    this.newItem = {
      category: 'Consultoría',
      amount_approved: 0,
      amount_executed: 0
    };
    this.showModal = true;
  }

  editItem(item: BudgetItem) {
    this.editingItem = item;
    this.newItem = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newItem = {};
  }

  saveItem() {
    if (this.selectedProject?.userRole === 'viewer') {
        alert('No tienes permiso para modificar el presupuesto.');
        return;
    }
    if (!this.boardId || !this.newItem.description) return;

    if (this.editingItem && this.editingItem.id) {
      this.budgetService.updateBudgetItem(this.editingItem.id, this.newItem).subscribe(() => {
        this.closeModal();
        this.loadData();
      });
    } else {
      this.budgetService.createBudgetItem(this.boardId, this.newItem).subscribe(() => {
        this.closeModal();
        this.loadData();
      });
    }
  }

  deleteItem(id: string) {
    if (this.selectedProject?.userRole === 'viewer') return;
    
    if (confirm('¿Estás seguro de eliminar este item?')) {
      this.budgetService.deleteBudgetItem(id).subscribe(() => {
        this.loadData();
      });
    }
  }
}
