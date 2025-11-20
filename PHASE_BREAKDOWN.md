# 📋 NovaProject v2.0.0 - Desglose Detallado por Fases

## 🎯 FASE 1: Modernización de Módulos Existentes (3 semanas)

### Semana 1: Migración de Módulos de Bajo Riesgo

#### Día 1-2: Módulo Shared
**Archivos a migrar:**
- `modules/shared/components/` → standalone components
- `modules/shared/services/` → actualizar con inject()

**Tareas específicas:**
```bash
# 1. Migrar componentes shared
- card-color.component.ts → standalone
- loading-spinner.component.ts → standalone
- confirmation-dialog.component.ts → standalone

# 2. Actualizar servicios shared
- shared.service.ts → implementar Signals si aplica
```

#### Día 3-4: Módulo Layout
**Archivos a migrar:**
- `modules/layout/components/layout/layout.component.ts`
- `modules/layout/components/navbar/navbar.component.ts`
- `modules/layout/components/sidebar/sidebar.component.ts`

**Checklist:**
- [ ] Convertir LayoutComponent a standalone
- [ ] Actualizar imports en navbar y sidebar
- [ ] Verificar routing funciona correctamente
- [ ] Testing de navegación

#### Día 5: Módulo Profile
**Archivos a migrar:**
- `modules/profile/pages/profile/profile.component.ts`
- `modules/profile/services/profile.service.ts`

### Semana 2: Migración de Módulos de Medio Riesgo

#### Día 1-2: Módulo Users
**Archivos críticos:**
- `modules/users/pages/users-table/users-table.component.ts`
- `modules/users/services/users.service.ts`

**Consideraciones especiales:**
- Verificar permisos de admin
- Testing de CRUD operations
- Validar paginación y filtros

#### Día 3-5: Módulo My-Tasks
**Archivos a migrar:**
- `modules/my-tasks/pages/my-tasks-page/my-tasks-page.component.ts`
- Integrar con nuevo sistema de subtareas

### Semana 3: Migración de Módulos de Alto Riesgo

#### Día 1-3: Módulo Auth (CRÍTICO)
**Plan de migración cuidadosa:**

```typescript
// ANTES: modules/auth/auth.module.ts
@NgModule({
  declarations: [LoginComponent, RegisterComponent, ...],
  imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule],
  providers: [AuthService, AuthGuard]
})
export class AuthModule {}

// DESPUÉS: modules/auth/auth.routes.ts
export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component')
      .then(m => m.RegisterComponent)
  }
];
```

**Testing crítico:**
- [ ] Login flow completo
- [ ] Token refresh
- [ ] Guards funcionando
- [ ] Logout correcto
- [ ] Registro de usuarios

#### Día 4-5: Módulo Boards (CORE BUSINESS)
**Componentes críticos:**
- `board.component.ts` - Vista principal de tablero
- `todo-dialog.component.ts` - Modal de edición de tarjetas
- `boards.component.ts` - Lista de tableros

**Plan de testing exhaustivo:**
- [ ] Crear tablero
- [ ] Editar tablero
- [ ] Eliminar tablero
- [ ] Crear tarjeta
- [ ] Mover tarjetas entre listas
- [ ] Asignar miembros
- [ ] Establecer fechas

## 🚀 FASE 2: Nuevas Funcionalidades v2.0.0 (4 semanas)

### Semana 1-2: Sistema de Calendario Avanzado

#### Estructura de archivos:
```
features/calendar/
├── calendar.component.ts           # Componente principal
├── components/
│   ├── calendar-header.component.ts
│   ├── event-details.component.ts
│   └── calendar-filters.component.ts
├── services/
│   └── calendar.service.ts
├── models/
│   └── calendar-event.model.ts
└── calendar.routes.ts
```

#### Día 1-3: Implementación Base
```typescript
// features/calendar/calendar.component.ts
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, CalendarHeaderComponent],
  template: `
    <div class="calendar-page">
      <app-calendar-header
        [currentView]="currentView()"
        (viewChange)="onViewChange($event)"
        (filterChange)="onFilterChange($event)"
      ></app-calendar-header>
      
      <full-calendar
        [options]="calendarOptions()"
        (eventClick)="onEventClick($event)"
        (dateClick)="onDateClick($event)"
        (eventDrop)="onEventDrop($event)"
      ></full-calendar>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private cardsService = inject(CardsService);
  private calendarService = inject(CalendarService);
  
  currentView = signal<CalendarView>('dayGridMonth');
  filters = signal<CalendarFilters>({
    boards: [],
    priorities: [],
    assignees: []
  });
  
  calendarOptions = computed(() => ({
    initialView: this.currentView(),
    events: this.getFilteredEvents(),
    editable: true,
    droppable: true,
    locale: 'es',
    headerToolbar: false, // Custom header
    height: 'auto',
    eventClassNames: (arg) => this.getEventClasses(arg.event),
    eventContent: (arg) => this.renderEventContent(arg.event)
  }));
}
```

#### Día 4-7: Funcionalidades Avanzadas
- Filtros por proyecto, prioridad, asignado
- Arrastrar y soltar para cambiar fechas
- Vista de agenda personalizada
- Exportar calendario (iCal)
- Notificaciones de vencimientos

### Semana 3: Sistema de Subtareas Completo

#### Estructura de archivos:
```
features/subtasks/
├── components/
│   ├── subtasks-section.component.ts
│   ├── subtask-item.component.ts
│   ├── subtask-form.component.ts
│   └── subtask-progress.component.ts
├── services/
│   └── subtasks.service.ts
├── models/
│   └── subtask.model.ts
└── pipes/
    └── subtask-filter.pipe.ts
```

#### Implementación del servicio:
```typescript
// features/subtasks/services/subtasks.service.ts
@Injectable({providedIn: 'root'})
export class SubtasksService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  
  private subtasksSignal = signal<Subtask[]>([]);
  public subtasks = this.subtasksSignal.asReadonly();
  
  // Computed signals para diferentes vistas
  getSubtasksByCardId = (cardId: string) => computed(() =>
    this.subtasks()
      .filter(subtask => subtask.cardId === cardId)
      .sort((a, b) => a.order - b.order)
  );
  
  getOverdueSubtasks = computed(() =>
    this.subtasks().filter(subtask => 
      !subtask.completed && 
      subtask.dueDate && 
      new Date(subtask.dueDate) < new Date()
    )
  );
  
  getSubtasksByAssignee = (assigneeId: string) => computed(() =>
    this.subtasks().filter(subtask => subtask.assigneeId === assigneeId)
  );
  
  // Métrica de progreso avanzada
  getProgressByCardId = (cardId: string) => computed(() => {
    const cardSubtasks = this.getSubtasksByCardId(cardId)();
    const completed = cardSubtasks.filter(s => s.completed).length;
    const total = cardSubtasks.length;
    const overdue = cardSubtasks.filter(s => 
      !s.completed && s.dueDate && new Date(s.dueDate) < new Date()
    ).length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      remaining: total - completed,
      overdue,
      onTrack: total - completed - overdue
    };
  });

  async createSubtask(cardId: string, subtaskData: CreateSubtaskDto): Promise<void> {
    try {
      const newSubtask = await firstValueFrom(
        this.http.post<Subtask>(`/api/cards/${cardId}/subtasks`, {
          ...subtaskData,
          order: this.getNextOrder(cardId)
        })
      );
      
      this.subtasksSignal.update(current => [...current, newSubtask]);
      this.toastr.success('Subtarea creada exitosamente');
    } catch (error) {
      this.toastr.error('Error al crear la subtarea');
      throw error;
    }
  }

  async reorderSubtasks(cardId: string, subtaskIds: string[]): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`/api/cards/${cardId}/subtasks/reorder`, { subtaskIds })
      );
      
      // Actualizar orden local
      this.subtasksSignal.update(current =>
        current.map(subtask => {
          if (subtask.cardId === cardId) {
            const newOrder = subtaskIds.indexOf(subtask.id);
            return { ...subtask, order: newOrder };
          }
          return subtask;
        })
      );
    } catch (error) {
      this.toastr.error('Error al reordenar subtareas');
      throw error;
    }
  }
}
```

### Semana 4: Sistema de Objetivos de Proyecto

#### Estructura de archivos:
```
features/objectives/
├── components/
│   ├── board-objectives.component.ts
│   ├── objective-card.component.ts
│   ├── add-objective-modal.component.ts
│   ├── objective-progress.component.ts
│   └── objectives-dashboard.component.ts
├── services/
│   └── objectives.service.ts
├── models/
│   └── objective.model.ts
└── pipes/
    └── objective-status.pipe.ts
```

#### Modelo de datos avanzado:
```typescript
// features/objectives/models/objective.model.ts
export interface Objective {
  id: string;
  boardId: string;
  title: string;
  description: string;
  targetDate: Date;
  status: ObjectiveStatus;
  priority: Priority;
  progress: number; // 0-100
  assigneeId?: string;
  linkedCardIds: string[];
  
  // Métricas avanzadas
  metrics?: {
    target: number;
    current: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  };
  
  // Hitos del objetivo
  milestones: ObjectiveMilestone[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ObjectiveMilestone {
  id: string;
  title: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export type ObjectiveStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'blocked' 
  | 'cancelled';
```

## ⚡ FASE 3: Integración y Optimización (2 semanas)

### Semana 1: Integración de Funcionalidades

#### Día 1-3: Modificar TodoDialogComponent
```typescript
// modules/boards/components/todo-dialog/todo-dialog.component.ts
@Component({
  selector: 'app-todo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // NUEVAS IMPORTACIONES
    SubtasksSectionComponent,
    ObjectiveLinkComponent,
    CalendarIntegrationComponent
  ],
  template: `
    <div class="todo-dialog-enhanced">
      <!-- Header existente -->
      
      <!-- Tabs para organizar contenido -->
      <div class="dialog-tabs">
        <button [class.active]="activeTab() === 'details'" 
                (click)="setActiveTab('details')">
          📝 Detalles
        </button>
        <button [class.active]="activeTab() === 'subtasks'" 
                (click)="setActiveTab('subtasks')">
          ✅ Subtareas ({{ subtaskProgress().total }})
        </button>
        <button [class.active]="activeTab() === 'objectives'" 
                (click)="setActiveTab('objectives')">
          🎯 Objetivos
        </button>
        <button [class.active]="activeTab() === 'activity'" 
                (click)="setActiveTab('activity')">
          📊 Actividad
        </button>
      </div>

      <!-- Contenido por tabs -->
      <div class="tab-content">
        @switch (activeTab()) {
          @case ('details') {
            <!-- Contenido existente de detalles -->
          }
          @case ('subtasks') {
            <app-subtasks-section 
              [cardId]="cardId"
              (progressUpdate)="onSubtaskProgressUpdate($event)"
            ></app-subtasks-section>
          }
          @case ('objectives') {
            <app-objective-link
              [cardId]="cardId"
              [boardId]="boardId"
            ></app-objective-link>
          }
          @case ('activity') {
            <!-- Actividad y comentarios -->
          }
        }
      </div>
    </div>
  `
})
export class TodoDialogComponent implements OnInit {
  activeTab = signal<string>('details');
  
  // Integrar con nuevos servicios
  subtaskProgress = computed(() =>
    this.subtasksService.getProgressByCardId(this.cardId)()
  );
  
  linkedObjectives = computed(() =>
    this.objectivesService.getObjectivesByCardId(this.cardId)()
  );
}
```

#### Día 4-5: Dashboard Integrado
Crear dashboard que muestre:
- Resumen de objetivos por proyecto
- Calendario de vencimientos
- Progreso de subtareas
- Métricas de productividad

### Semana 2: Optimización de Performance

#### Día 1-2: Lazy Loading Optimizado
```typescript
// app.routes.ts - RUTAS OPTIMIZADAS CON PRELOADING
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/layout/components/layout/layout.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component'),
        data: { preload: true } // Precargar dashboard
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component'),
        data: { preload: false } // Cargar bajo demanda
      },
      {
        path: 'boards',
        loadChildren: () => import('./modules/boards/boards.routes'),
        data: { preload: true } // Core functionality
      }
    ]
  }
];
```

#### Día 3-4: Optimización de Signals
- Implementar computed signals eficientes
- Reducir re-renders innecesarios
- Optimizar subscripciones

#### Día 5: Bundle Analysis y Optimización
```bash
# Análisis de bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Optimizaciones específicas
- Tree shaking de librerías no usadas
- Code splitting por features
- Lazy loading de componentes pesados
```

## 📊 Métricas de Éxito

### Performance
- [ ] Bundle size reducido en 15-20%
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### Funcionalidad
- [ ] 100% de funcionalidades existentes migradas
- [ ] 3 nuevas funcionalidades implementadas
- [ ] 0 regresiones críticas
- [ ] Cobertura de tests > 80%

### Developer Experience
- [ ] Tiempo de build reducido en 10%
- [ ] Hot reload mejorado
- [ ] Mejor debugging con Signals
- [ ] Documentación actualizada

---

**Estado Actual:** ✅ Plan detallado completado
**Próximo Paso:** Comenzar FASE 1 - Semana 1
