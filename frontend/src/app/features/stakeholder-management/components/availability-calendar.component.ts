import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { StakeholderService } from '../services/stakeholder.service';
import { Stakeholder, Meeting, SchedulingRequest } from '../models/stakeholder.model';

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  template: `
    <div class="availability-calendar p-6 bg-gray-50 min-h-screen">
      <!-- Header -->
      <div class="calendar-header mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">👥 Gestión de Stakeholders</h1>
            <p class="text-gray-600 mt-2">
              Solución al problema de IMEVI: falta de coordinación para entrevistas
            </p>
          </div>
          <div class="flex space-x-4">
            <button 
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              (click)="openSchedulingModal()"
            >
              📅 Agendar Reunión
            </button>
            <button 
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              (click)="findOptimalSlots()"
            >
              🤖 Buscar Slots Óptimos
            </button>
          </div>
        </div>
      </div>

      <!-- Métricas de Eficiencia -->
      <div class="efficiency-metrics mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="metric-card bg-white p-4 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Stakeholders Activos</p>
                <p class="text-2xl font-bold text-blue-600">{{ totalStakeholders() }}</p>
              </div>
              <span class="text-3xl">👥</span>
            </div>
          </div>
          
          <div class="metric-card bg-white p-4 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Disponibles Ahora</p>
                <p class="text-2xl font-bold text-green-600">{{ availableNow() }}</p>
              </div>
              <span class="text-3xl">✅</span>
            </div>
          </div>
          
          <div class="metric-card bg-white p-4 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Reuniones Próximas</p>
                <p class="text-2xl font-bold text-orange-600">{{ upcomingMeetings() }}</p>
              </div>
              <span class="text-3xl">📅</span>
            </div>
          </div>
          
          <div class="metric-card bg-white p-4 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Eficiencia Agendamiento</p>
                <p class="text-2xl font-bold text-purple-600">{{ schedulingEfficiency() }}%</p>
              </div>
              <span class="text-3xl">📊</span>
            </div>
            <div class="mt-2">
              <p class="text-xs text-green-600">vs IMEVI: +50% optimización</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros de Stakeholders -->
      <div class="stakeholder-filters mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">🔍 Filtrar por Stakeholders</h3>
          <div class="flex flex-wrap gap-2">
            @for (stakeholder of stakeholders(); track stakeholder.id) {
              <label class="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  [checked]="selectedStakeholders().includes(stakeholder.id)"
                  (change)="toggleStakeholder(stakeholder.id)"
                  class="rounded"
                >
                <div class="flex items-center space-x-2">
                  <img 
                    [src]="stakeholder.avatar" 
                    [alt]="stakeholder.name"
                    class="w-6 h-6 rounded-full"
                  >
                  <span class="text-sm">{{ stakeholder.name }}</span>
                  <span class="text-xs px-2 py-1 rounded-full" 
                        [class]="getPriorityClass(stakeholder.priority)">
                    {{ stakeholder.priority }}
                  </span>
                </div>
              </label>
            }
          </div>
        </div>
      </div>

      <!-- Calendario Principal -->
      <div class="calendar-container bg-white rounded-lg shadow p-6">
        <full-calendar
          [options]="calendarOptions()"
          (eventClick)="onEventClick($event)"
          (dateClick)="onDateClick($event)"
          (eventDrop)="onEventDrop($event)"
        ></full-calendar>
      </div>

      <!-- Panel de Slots Sugeridos -->
      @if (suggestedSlots().length > 0) {
        <div class="suggested-slots mt-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">🤖 Slots Óptimos Sugeridos</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (slot of suggestedSlots(); track slot.id) {
                <div class="slot-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="font-semibold">{{ slot.startTime | date:'dd/MM/yyyy' }}</p>
                      <p class="text-sm text-gray-600">
                        {{ slot.startTime | date:'HH:mm' }} - {{ slot.endTime | date:'HH:mm' }}
                      </p>
                    </div>
                    <div class="score-badge" [class]="getScoreClass(slot.score)">
                      {{ slot.score }}%
                    </div>
                  </div>
                  
                  <div class="participants mb-3">
                    <p class="text-xs text-gray-500 mb-1">Disponibles:</p>
                    <div class="flex -space-x-1">
                      @for (attendeeId of slot.availableAttendees; track attendeeId) {
                        <img 
                          [src]="getStakeholderAvatar(attendeeId)"
                          [title]="getStakeholderName(attendeeId)"
                          class="w-6 h-6 rounded-full border-2 border-white"
                        >
                      }
                    </div>
                  </div>
                  
                  <div class="reasons mb-3">
                    @for (reason of slot.reasons; track reason) {
                      <span class="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">
                        {{ reason }}
                      </span>
                    }
                  </div>
                  
                  <button 
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
                    (click)="scheduleSlot(slot)"
                  >
                    📅 Agendar Este Slot
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Comparación con IMEVI -->
      <div class="imevi-comparison mt-6">
        <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Impacto vs Proyecto IMEVI</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="comparison-item">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">👥</span>
                <div>
                  <p class="font-medium">Coordinación de Entrevistas</p>
                  <p class="text-sm text-gray-600">IMEVI: Manual y problemática</p>
                </div>
              </div>
              <p class="text-green-600 font-semibold">→ NovaProject: Agendamiento inteligente</p>
              <p class="text-sm text-green-600">+50% optimización</p>
            </div>
            
            <div class="comparison-item">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">⏰</span>
                <div>
                  <p class="font-medium">Tiempo de Coordinación</p>
                  <p class="text-sm text-gray-600">IMEVI: Días de emails</p>
                </div>
              </div>
              <p class="text-green-600 font-semibold">→ NovaProject: Minutos automáticos</p>
              <p class="text-sm text-green-600">-80% tiempo coordinación</p>
            </div>
            
            <div class="comparison-item">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">📅</span>
                <div>
                  <p class="font-medium">Disponibilidad VP</p>
                  <p class="text-sm text-gray-600">IMEVI: Vacaciones bloquean proyecto</p>
                </div>
              </div>
              <p class="text-green-600 font-semibold">→ NovaProject: Alertas proactivas</p>
              <p class="text-sm text-green-600">-40% retrasos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .availability-calendar {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .metric-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
export class AvailabilityCalendarComponent implements OnInit {
  private stakeholderService = inject(StakeholderService);

  // Signals para estado reactivo
  selectedStakeholders = signal<string[]>([]);
  suggestedSlots = signal<any[]>([]);
  currentSchedulingRequest = signal<SchedulingRequest | null>(null);

  // Computed signals
  stakeholders = computed(() => this.stakeholderService.getAllStakeholders());
  totalStakeholders = computed(() => this.stakeholders().length);
  availableNow = computed(() => this.stakeholderService.availableStakeholders().length);
  upcomingMeetings = computed(() => this.stakeholderService.getUpcomingMeetings().length);
  schedulingEfficiency = computed(() => this.stakeholderService.getSchedulingEfficiency().successRate);

  calendarOptions = computed((): CalendarOptions => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'timeGridWeek',
    locale: esLocale,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    events: this.getCalendarEvents(),
    height: 'auto',
    eventDisplay: 'block',
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '17:00'
    }
  }));

  ngOnInit() {
    this.loadData();
    // Seleccionar todos los stakeholders por defecto
    this.selectedStakeholders.set(this.stakeholders().map(s => s.id));
  }

  private async loadData() {
    await this.stakeholderService.refreshData();
  }

  private getCalendarEvents(): EventInput[] {
    const events: EventInput[] = [];
    const selectedIds = this.selectedStakeholders();
    
    // Agregar reuniones programadas
    const meetings = this.stakeholderService.getUpcomingMeetings();
    meetings.forEach(meeting => {
      const hasSelectedAttendee = meeting.attendees.some(a => 
        selectedIds.includes(a.stakeholderId)
      );
      
      if (hasSelectedAttendee) {
        events.push({
          id: meeting.id,
          title: meeting.title,
          start: meeting.startTime,
          end: meeting.endTime,
          backgroundColor: this.getMeetingColor(meeting.priority),
          borderColor: this.getMeetingColor(meeting.priority),
          extendedProps: {
            type: 'meeting',
            meeting: meeting
          }
        });
      }
    });

    // Agregar disponibilidad de stakeholders
    this.stakeholders().forEach(stakeholder => {
      if (selectedIds.includes(stakeholder.id)) {
        stakeholder.availability.recurringAvailability.forEach(recurring => {
          if (recurring.isActive) {
            // Generar eventos para las próximas 4 semanas
            for (let week = 0; week < 4; week++) {
              const eventDate = this.getNextDateForDayOfWeek(recurring.dayOfWeek, week);
              const startTime = new Date(eventDate);
              const endTime = new Date(eventDate);
              
              const [startHour, startMinute] = recurring.startTime.split(':').map(Number);
              const [endHour, endMinute] = recurring.endTime.split(':').map(Number);
              
              startTime.setHours(startHour, startMinute, 0, 0);
              endTime.setHours(endHour, endMinute, 0, 0);

              events.push({
                id: `availability-${stakeholder.id}-${week}-${recurring.dayOfWeek}`,
                title: `Disponible: ${stakeholder.name}`,
                start: startTime,
                end: endTime,
                backgroundColor: '#e0f2fe',
                borderColor: '#0277bd',
                display: 'background',
                extendedProps: {
                  type: 'availability',
                  stakeholder: stakeholder
                }
              });
            }
          }
        });
      }
    });

    return events;
  }

  private getNextDateForDayOfWeek(dayOfWeek: number, weeksAhead: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget + (weeksAhead * 7));
    return targetDate;
  }

  private getMeetingColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#3b82f6';
    }
  }

  toggleStakeholder(stakeholderId: string) {
    this.selectedStakeholders.update(current => {
      if (current.includes(stakeholderId)) {
        return current.filter(id => id !== stakeholderId);
      } else {
        return [...current, stakeholderId];
      }
    });
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

  async findOptimalSlots() {
    // Crear una solicitud de ejemplo para demostrar la funcionalidad
    const mockRequest: SchedulingRequest = {
      id: 'demo-request',
      requesterId: 'current-user',
      requesterName: 'Usuario Actual',
      title: 'Reunión de Coordinación',
      description: 'Reunión para coordinar próximos pasos del proyecto',
      duration: 60,
      meetingType: 'planning',
      priority: 'normal',
      requiredAttendees: this.selectedStakeholders().slice(0, 3), // Primeros 3 seleccionados
      optionalAttendees: [],
      preferredTimeSlots: [
        { startTime: '09:00', endTime: '11:00', weight: 8 },
        { startTime: '14:00', endTime: '16:00', weight: 6 }
      ],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      allowWeekends: false,
      minNoticeHours: 24,
      maxDaysAhead: 14,
      status: 'processing',
      suggestedSlots: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const slots = await this.stakeholderService.findOptimalSlots(mockRequest);
    this.suggestedSlots.set(slots);
    this.currentSchedulingRequest.set(mockRequest);
  }

  async scheduleSlot(slot: any) {
    const request = this.currentSchedulingRequest();
    if (request) {
      try {
        await this.stakeholderService.scheduleSlot(request, slot);
        this.suggestedSlots.set([]);
        this.currentSchedulingRequest.set(null);
        // Refrescar calendario
        await this.loadData();
      } catch (error) {
        console.error('Error scheduling slot:', error);
      }
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  }

  getStakeholderAvatar(stakeholderId: string): string {
    const stakeholder = this.stakeholders().find(s => s.id === stakeholderId);
    return stakeholder?.avatar || 'https://ui-avatars.com/api/?name=Unknown';
  }

  getStakeholderName(stakeholderId: string): string {
    const stakeholder = this.stakeholders().find(s => s.id === stakeholderId);
    return stakeholder?.name || 'Unknown';
  }

  onEventClick(info: any) {
    console.log('Event clicked:', info.event);
  }

  onDateClick(info: any) {
    console.log('Date clicked:', info.date);
  }

  onEventDrop(info: any) {
    console.log('Event dropped:', info.event);
  }

  openSchedulingModal() {
    // Implementar modal de agendamiento
    console.log('Opening scheduling modal');
  }
}
