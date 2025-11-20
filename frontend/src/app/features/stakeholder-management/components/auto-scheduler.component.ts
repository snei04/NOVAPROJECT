import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { StakeholderService } from '../services/stakeholder.service';
import { 
  SchedulingRequest, 
  SuggestedSlot, 
  MeetingType, 
  MeetingPriority,
  Stakeholder 
} from '../models/stakeholder.model';

@Component({
  selector: 'app-auto-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="auto-scheduler bg-white rounded-lg shadow-lg p-6">
      <div class="scheduler-header mb-6">
        <h2 class="text-2xl font-bold text-gray-900">🤖 Agendamiento Automático</h2>
        <p class="text-gray-600 mt-2">
          Solución inteligente para coordinar entrevistas - Resuelve problema IMEVI
        </p>
      </div>

      @if (currentStep() === 'form') {
        <!-- Formulario de Solicitud -->
        <form [formGroup]="schedulingForm" (ngSubmit)="onSubmitRequest()" class="space-y-6">
          <!-- Información Básica -->
          <div class="form-section">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📝 Información de la Reunión</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Título de la Reunión *
                </label>
                <input
                  type="text"
                  formControlName="title"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Entrevista de Requerimientos"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos) *
                </label>
                <select
                  formControlName="duration"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reunión *
                </label>
                <select
                  formControlName="meetingType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="interview">Entrevista</option>
                  <option value="review">Revisión</option>
                  <option value="planning">Planificación</option>
                  <option value="demo">Demostración</option>
                  <option value="training">Capacitación</option>
                  <option value="one_on_one">Uno a Uno</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad *
                </label>
                <select
                  formControlName="priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="urgent">🔴 Urgente</option>
                  <option value="high">🟡 Alta</option>
                  <option value="normal">🟢 Normal</option>
                  <option value="low">⚪ Baja</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                formControlName="description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el propósito y agenda de la reunión..."
              ></textarea>
            </div>
          </div>

          <!-- Selección de Participantes -->
          <div class="form-section">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">👥 Participantes</h3>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Participantes Requeridos *
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                @for (stakeholder of availableStakeholders(); track stakeholder.id) {
                  <label class="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      [value]="stakeholder.id"
                      (change)="onRequiredAttendeeChange(stakeholder.id, $event)"
                      class="rounded"
                    >
                    <img 
                      [src]="stakeholder.avatar" 
                      [alt]="stakeholder.name"
                      class="w-8 h-8 rounded-full"
                    >
                    <div class="flex-1">
                      <p class="font-medium text-sm">{{ stakeholder.name }}</p>
                      <p class="text-xs text-gray-500">{{ stakeholder.position }}</p>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full" 
                          [class]="getPriorityClass(stakeholder.priority)">
                      {{ stakeholder.priority }}
                    </span>
                  </label>
                }
              </div>
            </div>
          </div>

          <!-- Preferencias de Horario -->
          <div class="form-section">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">⏰ Preferencias de Horario</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Horario Preferido 1
                </label>
                <div class="flex space-x-2">
                  <input
                    type="time"
                    formControlName="preferredStart1"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                  <input
                    type="time"
                    formControlName="preferredEnd1"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Horario Preferido 2 (Opcional)
                </label>
                <div class="flex space-x-2">
                  <input
                    type="time"
                    formControlName="preferredStart2"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                  <input
                    type="time"
                    formControlName="preferredEnd2"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  formControlName="deadline"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  [min]="getMinDate()"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Aviso Mínimo (horas)
                </label>
                <select
                  formControlName="minNoticeHours"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="2">2 horas</option>
                  <option value="4">4 horas</option>
                  <option value="24">1 día</option>
                  <option value="48">2 días</option>
                </select>
              </div>
              
              <div class="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  formControlName="allowWeekends"
                  id="allowWeekends"
                  class="rounded"
                >
                <label for="allowWeekends" class="text-sm text-gray-700">
                  Permitir fines de semana
                </label>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="form-actions flex justify-end space-x-4">
            <button
              type="button"
              (click)="onCancel()"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="!schedulingForm.valid || isProcessing()"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isProcessing()) {
                <span class="flex items-center space-x-2">
                  <span class="animate-spin">⏳</span>
                  <span>Procesando...</span>
                </span>
              } @else {
                🤖 Buscar Slots Óptimos
              }
            </button>
          </div>
        </form>
      }

      @if (currentStep() === 'results') {
        <!-- Resultados de Slots Sugeridos -->
        <div class="scheduling-results">
          <div class="results-header mb-6">
            <h3 class="text-xl font-semibold text-gray-900">🎯 Slots Óptimos Encontrados</h3>
            <p class="text-gray-600">
              Algoritmo inteligente encontró {{ suggestedSlots().length }} opciones basadas en disponibilidad
            </p>
          </div>

          @if (suggestedSlots().length > 0) {
            <div class="slots-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              @for (slot of suggestedSlots(); track slot.id) {
                <div class="slot-card border-2 rounded-lg p-4 hover:shadow-md transition-all"
                     [class.border-blue-500]="selectedSlot()?.id === slot.id"
                     [class.border-gray-200]="selectedSlot()?.id !== slot.id">
                  
                  <!-- Header del Slot -->
                  <div class="slot-header flex justify-between items-start mb-3">
                    <div>
                      <p class="font-semibold text-lg">{{ slot.startTime | date:'EEEE' }}</p>
                      <p class="text-gray-600">{{ slot.startTime | date:'dd/MM/yyyy' }}</p>
                      <p class="text-sm text-gray-500">
                        {{ slot.startTime | date:'HH:mm' }} - {{ slot.endTime | date:'HH:mm' }}
                      </p>
                    </div>
                    <div class="score-badge" [class]="getScoreClass(slot.score)">
                      {{ slot.score }}%
                    </div>
                  </div>

                  <!-- Participantes Disponibles -->
                  <div class="participants mb-3">
                    <p class="text-xs font-medium text-gray-700 mb-2">
                      Disponibles ({{ slot.availableAttendees.length }}/{{ getTotalRequiredAttendees() }}):
                    </p>
                    <div class="flex flex-wrap gap-1">
                      @for (attendeeId of slot.availableAttendees; track attendeeId) {
                        <div class="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          <img 
                            [src]="getStakeholderAvatar(attendeeId)"
                            class="w-4 h-4 rounded-full"
                          >
                          <span>{{ getStakeholderName(attendeeId) }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Conflictos -->
                  @if (slot.conflictingAttendees.length > 0) {
                    <div class="conflicts mb-3">
                      <p class="text-xs font-medium text-red-700 mb-2">
                        Conflictos ({{ slot.conflictingAttendees.length }}):
                      </p>
                      <div class="flex flex-wrap gap-1">
                        @for (attendeeId of slot.conflictingAttendees; track attendeeId) {
                          <div class="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            <img 
                              [src]="getStakeholderAvatar(attendeeId)"
                              class="w-4 h-4 rounded-full"
                            >
                            <span>{{ getStakeholderName(attendeeId) }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Razones -->
                  <div class="reasons mb-4">
                    @for (reason of slot.reasons; track reason) {
                      <span class="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">
                        {{ reason }}
                      </span>
                    }
                  </div>

                  <!-- Botón de Selección -->
                  <button
                    (click)="selectSlot(slot)"
                    class="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors"
                    [class]="selectedSlot()?.id === slot.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    {{ selectedSlot()?.id === slot.id ? '✅ Seleccionado' : '📅 Seleccionar' }}
                  </button>
                </div>
              }
            </div>

            <!-- Acciones de Resultado -->
            <div class="results-actions flex justify-between items-center">
              <button
                (click)="goBackToForm()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Modificar Búsqueda
              </button>
              
              <div class="flex space-x-3">
                <button
                  (click)="onCancel()"
                  class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmScheduling()"
                  [disabled]="!selectedSlot() || isScheduling()"
                  class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  @if (isScheduling()) {
                    <span class="flex items-center space-x-2">
                      <span class="animate-spin">⏳</span>
                      <span>Agendando...</span>
                    </span>
                  } @else {
                    ✅ Confirmar y Agendar
                  }
                </button>
              </div>
            </div>
          } @else {
            <!-- No se encontraron slots -->
            <div class="no-slots text-center py-8">
              <div class="text-6xl mb-4">😔</div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron slots disponibles
              </h3>
              <p class="text-gray-600 mb-4">
                Intenta ajustar los criterios de búsqueda o las fechas preferidas
              </p>
              <button
                (click)="goBackToForm()"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                🔄 Intentar Nuevamente
              </button>
            </div>
          }
        </div>
      }

      @if (currentStep() === 'success') {
        <!-- Confirmación de Éxito -->
        <div class="success-message text-center py-8">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-xl font-semibold text-green-600 mb-2">
            ¡Reunión Agendada Exitosamente!
          </h3>
          <p class="text-gray-600 mb-4">
            Se han enviado invitaciones a todos los participantes
          </p>
          <div class="scheduled-details bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            @if (scheduledMeeting()) {
              <p class="font-semibold">{{ scheduledMeeting()?.title }}</p>
              <p class="text-sm text-gray-600">
                {{ scheduledMeeting()?.startTime | date:'EEEE, dd/MM/yyyy HH:mm' }}
              </p>
            }
          </div>
          <button
            (click)="resetScheduler()"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            📅 Agendar Otra Reunión
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .auto-scheduler {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .form-section {
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #fafafa;
    }
    
    .slot-card {
      transition: all 0.2s ease;
    }
    
    .slot-card:hover {
      transform: translateY(-2px);
    }
    
    .score-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .score-excellent {
      background: #d1fae5;
      color: #065f46;
    }
    
    .score-good {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .score-fair {
      background: #fef3c7;
      color: #92400e;
    }
    
    .score-poor {
      background: #fee2e2;
      color: #991b1b;
    }
  `]
})
export class AutoSchedulerComponent {
  @Output() schedulingComplete = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private stakeholderService = inject(StakeholderService);

  // Signals para estado
  currentStep = signal<'form' | 'results' | 'success'>('form');
  isProcessing = signal(false);
  isScheduling = signal(false);
  suggestedSlots = signal<SuggestedSlot[]>([]);
  selectedSlot = signal<SuggestedSlot | null>(null);
  scheduledMeeting = signal<any>(null);
  requiredAttendees = signal<string[]>([]);

  // Computed signals
  availableStakeholders = computed(() => this.stakeholderService.getAllStakeholders());

  // Formulario reactivo
  schedulingForm: FormGroup;

  constructor() {
    this.schedulingForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      duration: [60, Validators.required],
      meetingType: ['interview', Validators.required],
      priority: ['normal', Validators.required],
      preferredStart1: ['09:00', Validators.required],
      preferredEnd1: ['11:00', Validators.required],
      preferredStart2: ['14:00'],
      preferredEnd2: ['16:00'],
      deadline: [this.getDefaultDeadline(), Validators.required],
      minNoticeHours: [24, Validators.required],
      allowWeekends: [false]
    });
  }

  async onSubmitRequest() {
    if (this.schedulingForm.valid) {
      this.isProcessing.set(true);
      
      try {
        const formValue = this.schedulingForm.value;
        
        // Crear solicitud de agendamiento
        const request: SchedulingRequest = {
          id: `req-${Date.now()}`,
          requesterId: 'current-user',
          requesterName: 'Usuario Actual',
          title: formValue.title,
          description: formValue.description,
          duration: formValue.duration,
          meetingType: formValue.meetingType,
          priority: formValue.priority,
          requiredAttendees: this.requiredAttendees(),
          optionalAttendees: [],
          preferredTimeSlots: this.buildPreferredTimeSlots(formValue),
          deadline: new Date(formValue.deadline),
          allowWeekends: formValue.allowWeekends,
          minNoticeHours: formValue.minNoticeHours,
          maxDaysAhead: 14,
          status: 'processing',
          suggestedSlots: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Buscar slots óptimos
        const slots = await this.stakeholderService.findOptimalSlots(request);
        this.suggestedSlots.set(slots);
        this.currentStep.set('results');
        
      } catch (error) {
        console.error('Error finding optimal slots:', error);
      } finally {
        this.isProcessing.set(false);
      }
    }
  }

  private buildPreferredTimeSlots(formValue: any) {
    const slots = [];
    
    if (formValue.preferredStart1 && formValue.preferredEnd1) {
      slots.push({
        startTime: formValue.preferredStart1,
        endTime: formValue.preferredEnd1,
        weight: 8
      });
    }
    
    if (formValue.preferredStart2 && formValue.preferredEnd2) {
      slots.push({
        startTime: formValue.preferredStart2,
        endTime: formValue.preferredEnd2,
        weight: 6
      });
    }
    
    return slots;
  }

  onRequiredAttendeeChange(stakeholderId: string, event: any) {
    if (event.target.checked) {
      this.requiredAttendees.update(current => [...current, stakeholderId]);
    } else {
      this.requiredAttendees.update(current => current.filter(id => id !== stakeholderId));
    }
  }

  selectSlot(slot: SuggestedSlot) {
    this.selectedSlot.set(slot);
  }

  async confirmScheduling() {
    const slot = this.selectedSlot();
    if (!slot) return;

    this.isScheduling.set(true);
    
    try {
      // Crear request temporal para el scheduling
      const request: SchedulingRequest = {
        id: `req-${Date.now()}`,
        requesterId: 'current-user',
        requesterName: 'Usuario Actual',
        title: this.schedulingForm.value.title,
        description: this.schedulingForm.value.description,
        duration: this.schedulingForm.value.duration,
        meetingType: this.schedulingForm.value.meetingType,
        priority: this.schedulingForm.value.priority,
        requiredAttendees: this.requiredAttendees(),
        optionalAttendees: [],
        preferredTimeSlots: [],
        deadline: new Date(),
        allowWeekends: false,
        minNoticeHours: 24,
        maxDaysAhead: 14,
        status: 'scheduled',
        suggestedSlots: [slot],
        selectedSlot: slot,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const meeting = await this.stakeholderService.scheduleSlot(request, slot);
      this.scheduledMeeting.set(meeting);
      this.currentStep.set('success');
      this.schedulingComplete.emit(meeting);
      
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    } finally {
      this.isScheduling.set(false);
    }
  }

  goBackToForm() {
    this.currentStep.set('form');
    this.suggestedSlots.set([]);
    this.selectedSlot.set(null);
  }

  resetScheduler() {
    this.currentStep.set('form');
    this.suggestedSlots.set([]);
    this.selectedSlot.set(null);
    this.scheduledMeeting.set(null);
    this.requiredAttendees.set([]);
    this.schedulingForm.reset({
      duration: 60,
      meetingType: 'interview',
      priority: 'normal',
      preferredStart1: '09:00',
      preferredEnd1: '11:00',
      preferredStart2: '14:00',
      preferredEnd2: '16:00',
      deadline: this.getDefaultDeadline(),
      minNoticeHours: 24,
      allowWeekends: false
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  // Utility methods
  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  getDefaultDeadline(): string {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  }

  getStakeholderAvatar(stakeholderId: string): string {
    const stakeholder = this.availableStakeholders().find(s => s.id === stakeholderId);
    return stakeholder?.avatar || 'https://ui-avatars.com/api/?name=Unknown';
  }

  getStakeholderName(stakeholderId: string): string {
    const stakeholder = this.availableStakeholders().find(s => s.id === stakeholderId);
    return stakeholder?.name || 'Unknown';
  }

  getTotalRequiredAttendees(): number {
    return this.requiredAttendees().length;
  }
}
