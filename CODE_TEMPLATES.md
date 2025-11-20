# 🔧 NovaProject v2.0.0 - Templates de Código

## 📅 Template: Calendar Component

```typescript
// features/calendar/calendar.component.ts
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <h2>📅 Calendario NovaProject</h2>
        <div class="view-controls">
          <button (click)="changeView('dayGridMonth')" 
                  [class.active]="currentView() === 'dayGridMonth'">
            Mes
          </button>
          <button (click)="changeView('timeGridWeek')" 
                  [class.active]="currentView() === 'timeGridWeek'">
            Semana
          </button>
        </div>
      </div>
      <full-calendar [options]="calendarOptions()"></full-calendar>
    </div>
  `
})
export class CalendarComponent {
  private boardsService = inject(BoardsService);
  currentView = signal<string>('dayGridMonth');
  
  calendarOptions = computed(() => ({
    initialView: this.currentView(),
    events: this.getCalendarEvents(),
    locale: 'es'
  }));
}
```

## ✅ Template: Subtasks Service

```typescript
// features/subtasks/services/subtasks.service.ts
@Injectable({providedIn: 'root'})
export class SubtasksService {
  private http = inject(HttpClient);
  private subtasksSignal = signal<Subtask[]>([]);
  public subtasks = this.subtasksSignal.asReadonly();
  
  getSubtasksByCardId = (cardId: string) => computed(() =>
    this.subtasks().filter(s => s.cardId === cardId)
  );
  
  getProgressByCardId = (cardId: string) => computed(() => {
    const cardSubtasks = this.getSubtasksByCardId(cardId)();
    const completed = cardSubtasks.filter(s => s.completed).length;
    const total = cardSubtasks.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  });
}
```

## 🎯 Template: Objectives Component

```typescript
// features/objectives/components/board-objectives.component.ts
@Component({
  selector: 'app-board-objectives',
  standalone: true,
  imports: [CommonModule, ObjectiveCardComponent],
  template: `
    <div class="objectives-container">
      <h3>🎯 Objetivos del Proyecto</h3>
      <div class="objectives-grid">
        @for (objective of objectives(); track objective.id) {
          <app-objective-card [objective]="objective"></app-objective-card>
        }
      </div>
    </div>
  `
})
export class BoardObjectivesComponent {
  @Input({required: true}) boardId!: string;
  private objectivesService = inject(ObjectivesService);
  
  objectives = computed(() => 
    this.objectivesService.getObjectivesByBoardId(this.boardId)()
  );
}
```

## 🔄 Template: Standalone Migration

```typescript
// ANTES: Traditional Module Component
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html'
})
export class ExampleComponent {}

// DESPUÉS: Standalone Component
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './example.component.html'
})
export class ExampleComponent {
  private service = inject(ExampleService);
}
```

## 📊 Template: Signal Service

```typescript
// Template para migrar servicios a Signals
@Injectable({providedIn: 'root'})
export class ModernService {
  private http = inject(HttpClient);
  
  // Signal state
  private dataSignal = signal<DataType[]>([]);
  public data = this.dataSignal.asReadonly();
  
  // Computed properties
  public filteredData = computed(() => 
    this.data().filter(item => item.active)
  );
  
  // Async operations
  async loadData(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<DataType[]>('/api/data'));
      this.dataSignal.set(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
}
```
