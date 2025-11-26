import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Stakeholder, 
  StakeholderAvailability, 
  Meeting, 
  SchedulingRequest,
  SuggestedSlot,
  StakeholderAnalytics,
  MeetingType,
  StakeholderPriority,
  AvailabilitySlot
} from '../models/stakeholder.model';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {
  private http = inject(HttpClient);

  // Signals para estado reactivo
  private stakeholdersSignal = signal<Stakeholder[]>([]);
  private availabilitySignal = signal<StakeholderAvailability[]>([]);
  private meetingsSignal = signal<Meeting[]>([]);
  private schedulingRequestsSignal = signal<SchedulingRequest[]>([]);

  // Public readonly signals
  public stakeholders = this.stakeholdersSignal.asReadonly();
  public availability = this.availabilitySignal.asReadonly();
  public meetings = this.meetingsSignal.asReadonly();
  public schedulingRequests = this.schedulingRequestsSignal.asReadonly();

  // Computed signals para análisis
  public totalStakeholders = computed(() => this.stakeholders().length);
  
  public stakeholdersByPriority = computed(() => {
    const stakeholders = this.stakeholders();
    return {
      critical: stakeholders.filter(s => s.priority === 'critical').length,
      high: stakeholders.filter(s => s.priority === 'high').length,
      medium: stakeholders.filter(s => s.priority === 'medium').length,
      low: stakeholders.filter(s => s.priority === 'low').length
    };
  });

  public availableStakeholders = computed(() => {
    const now = new Date();
    return this.stakeholders().filter(stakeholder => {
      const availability = this.getStakeholderAvailability(stakeholder.id);
      return availability && this.isCurrentlyAvailable(stakeholder.id, now);
    });
  });

  public upcomingMeetings = computed(() => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return this.meetings()
      .filter(meeting => 
        meeting.startTime >= now && 
        meeting.startTime <= next24Hours &&
        meeting.status === 'scheduled'
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  });

  public pendingSchedulingRequests = computed(() => 
    this.schedulingRequests().filter(req => 
      req.status === 'pending' || req.status === 'processing'
    )
  );

  // Métricas de eficiencia (resuelve problema IMEVI)
  public schedulingEfficiency = computed(() => {
    const requests = this.schedulingRequests();
    const successful = requests.filter(r => r.status === 'scheduled').length;
    const total = requests.length;
    
    return {
      successRate: total > 0 ? (successful / total) * 100 : 0,
      totalRequests: total,
      successfulScheduling: successful,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      failedRequests: requests.filter(r => r.status === 'failed').length
    };
  });

  // Métodos para cargar datos
  async loadStakeholders(): Promise<void> {
    try {
      // Mock data - después se conectará a la API real
      const mockStakeholders: Stakeholder[] = [
        {
          id: 'stakeholder-1',
          name: 'María González',
          email: 'maria.gonzalez@company.com',
          phone: '+57 300 123 4567',
          role: 'executive',
          department: 'Vicepresidencia',
          position: 'Vicepresidenta de Operaciones',
          priority: 'critical',
          avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=random',
          contactPreferences: ['email', 'phone'],
          timezone: 'America/Bogota',
          language: 'es',
          availability: {
            id: 'avail-1',
            stakeholderId: 'stakeholder-1',
            availableSlots: [],
            recurringAvailability: [
              {
                id: 'recurring-1',
                dayOfWeek: 1, // Lunes
                startTime: '09:00',
                endTime: '11:00',
                isActive: true,
                exceptions: []
              },
              {
                id: 'recurring-2',
                dayOfWeek: 3, // Miércoles
                startTime: '14:00',
                endTime: '16:00',
                isActive: true,
                exceptions: []
              }
            ],
            lastUpdated: new Date()
          },
          workingHours: {
            monday: { start: '08:00', end: '17:00', isWorkingDay: true },
            tuesday: { start: '08:00', end: '17:00', isWorkingDay: true },
            wednesday: { start: '08:00', end: '17:00', isWorkingDay: true },
            thursday: { start: '08:00', end: '17:00', isWorkingDay: true },
            friday: { start: '08:00', end: '15:00', isWorkingDay: true },
            saturday: { start: '00:00', end: '00:00', isWorkingDay: false },
            sunday: { start: '00:00', end: '00:00', isWorkingDay: false }
          },
          blackoutDates: [
            {
              startDate: new Date('2024-12-20'),
              endDate: new Date('2024-01-05'),
              reason: 'Vacaciones de fin de año'
            }
          ],
          lastInteraction: new Date('2024-01-10'),
          totalMeetings: 15,
          averageResponseTime: 4, // 4 horas
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: false,
            reminderTiming: [1440, 60, 15], // 1 día, 1 hora, 15 min
            escalationEnabled: true,
            escalationDelay: 24
          },
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date(),
          isActive: true
        },
        {
          id: 'stakeholder-2',
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@company.com',
          phone: '+57 301 987 6543',
          role: 'manager',
          department: 'IT',
          position: 'Gerente de Tecnología',
          priority: 'high',
          avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=random',
          contactPreferences: ['email', 'teams'],
          timezone: 'America/Bogota',
          language: 'es',
          availability: {
            id: 'avail-2',
            stakeholderId: 'stakeholder-2',
            availableSlots: [],
            recurringAvailability: [
              {
                id: 'recurring-3',
                dayOfWeek: 2, // Martes
                startTime: '10:00',
                endTime: '12:00',
                isActive: true,
                exceptions: []
              },
              {
                id: 'recurring-4',
                dayOfWeek: 4, // Jueves
                startTime: '15:00',
                endTime: '17:00',
                isActive: true,
                exceptions: []
              }
            ],
            lastUpdated: new Date()
          },
          workingHours: {
            monday: { start: '09:00', end: '18:00', isWorkingDay: true },
            tuesday: { start: '09:00', end: '18:00', isWorkingDay: true },
            wednesday: { start: '09:00', end: '18:00', isWorkingDay: true },
            thursday: { start: '09:00', end: '18:00', isWorkingDay: true },
            friday: { start: '09:00', end: '17:00', isWorkingDay: true },
            saturday: { start: '00:00', end: '00:00', isWorkingDay: false },
            sunday: { start: '00:00', end: '00:00', isWorkingDay: false }
          },
          blackoutDates: [],
          lastInteraction: new Date('2024-01-12'),
          totalMeetings: 8,
          averageResponseTime: 2, // 2 horas
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            reminderTiming: [60, 15], // 1 hora, 15 min
            escalationEnabled: false,
            escalationDelay: 0
          },
          createdAt: new Date('2023-06-01'),
          updatedAt: new Date(),
          isActive: true
        },
        {
          id: 'stakeholder-3',
          name: 'Ana Martínez',
          email: 'ana.martinez@company.com',
          role: 'team_lead',
          department: 'Desarrollo',
          position: 'Líder Técnico',
          priority: 'medium',
          avatar: 'https://ui-avatars.com/api/?name=Ana+Martinez&background=random',
          contactPreferences: ['email', 'slack'],
          timezone: 'America/Bogota',
          language: 'es',
          availability: {
            id: 'avail-3',
            stakeholderId: 'stakeholder-3',
            availableSlots: [],
            recurringAvailability: [
              {
                id: 'recurring-5',
                dayOfWeek: 1, // Lunes
                startTime: '14:00',
                endTime: '16:00',
                isActive: true,
                exceptions: []
              },
              {
                id: 'recurring-6',
                dayOfWeek: 5, // Viernes
                startTime: '10:00',
                endTime: '12:00',
                isActive: true,
                exceptions: []
              }
            ],
            lastUpdated: new Date()
          },
          workingHours: {
            monday: { start: '08:00', end: '17:00', isWorkingDay: true },
            tuesday: { start: '08:00', end: '17:00', isWorkingDay: true },
            wednesday: { start: '08:00', end: '17:00', isWorkingDay: true },
            thursday: { start: '08:00', end: '17:00', isWorkingDay: true },
            friday: { start: '08:00', end: '17:00', isWorkingDay: true },
            saturday: { start: '00:00', end: '00:00', isWorkingDay: false },
            sunday: { start: '00:00', end: '00:00', isWorkingDay: false }
          },
          blackoutDates: [],
          lastInteraction: new Date('2024-01-08'),
          totalMeetings: 12,
          averageResponseTime: 6, // 6 horas
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            reminderTiming: [60], // 1 hora
            escalationEnabled: false,
            escalationDelay: 0
          },
          createdAt: new Date('2023-03-15'),
          updatedAt: new Date(),
          isActive: true
        }
      ];

      this.stakeholdersSignal.set(mockStakeholders);
      
      // Cargar availability separadamente
      const availabilities = mockStakeholders.map(s => s.availability);
      this.availabilitySignal.set(availabilities);
      
      await this.loadMockMeetings();
      await this.loadMockSchedulingRequests();
      
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      throw error;
    }
  }

  private async loadMockMeetings(): Promise<void> {
    const mockMeetings: Meeting[] = [
      {
        id: 'meeting-1',
        title: 'Entrevista de Requerimientos - IMEVI',
        description: 'Revisión de requerimientos funcionales para el proyecto IMEVI',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // En 3 horas
        location: 'Sala de Juntas Virtual',
        meetingType: 'interview',
        organizer: 'current-user',
        attendees: [
          {
            stakeholderId: 'stakeholder-1',
            stakeholderName: 'María González',
            email: 'maria.gonzalez@company.com',
            status: 'accepted',
            responseDate: new Date()
          }
        ],
        status: 'scheduled',
        priority: 'high',
        allowRescheduling: true,
        requiresConfirmation: true,
        sendReminders: true,
        agenda: [
          'Revisión de objetivos del proyecto',
          'Identificación de stakeholders clave',
          'Definición de criterios de éxito'
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user'
      }
    ];

    this.meetingsSignal.set(mockMeetings);
  }

  private async loadMockSchedulingRequests(): Promise<void> {
    const mockRequests: SchedulingRequest[] = [
      {
        id: 'req-1',
        requesterId: 'current-user',
        requesterName: 'Usuario Actual',
        title: 'Revisión de Avances - Proyecto NovaProject',
        description: 'Reunión semanal para revisar el progreso del proyecto',
        duration: 60,
        meetingType: 'review',
        priority: 'normal',
        requiredAttendees: ['stakeholder-1', 'stakeholder-2'],
        optionalAttendees: ['stakeholder-3'],
        preferredTimeSlots: [
          {
            startTime: '09:00',
            endTime: '11:00',
            weight: 8
          },
          {
            startTime: '14:00',
            endTime: '16:00',
            weight: 6
          }
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 1 semana
        allowWeekends: false,
        minNoticeHours: 24,
        maxDaysAhead: 14,
        status: 'options_available',
        suggestedSlots: [
          {
            id: 'slot-1',
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Pasado mañana 9am
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Pasado mañana 10am
            score: 85,
            availableAttendees: ['stakeholder-1', 'stakeholder-2', 'stakeholder-3'],
            conflictingAttendees: [],
            reasons: ['Todos los participantes disponibles', 'Horario preferido', 'Sin conflictos']
          },
          {
            id: 'slot-2',
            startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // En 3 días 2pm
            endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // En 3 días 3pm
            score: 75,
            availableAttendees: ['stakeholder-1', 'stakeholder-2'],
            conflictingAttendees: ['stakeholder-3'],
            reasons: ['Participantes críticos disponibles', 'Horario alternativo']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.schedulingRequestsSignal.set(mockRequests);
  }

  // Métodos para gestión de stakeholders
  getStakeholderById(id: string): Stakeholder | undefined {
    return this.stakeholders().find(s => s.id === id);
  }

  getStakeholdersByRole(role: string): Stakeholder[] {
    return this.stakeholders().filter(s => s.role === role);
  }

  getStakeholdersByPriority(priority: StakeholderPriority): Stakeholder[] {
    return this.stakeholders().filter(s => s.priority === priority);
  }

  getStakeholderAvailability(stakeholderId: string): StakeholderAvailability | undefined {
    return this.availability().find(a => a.stakeholderId === stakeholderId);
  }

  // Métodos para verificar disponibilidad
  isCurrentlyAvailable(stakeholderId: string, dateTime: Date): boolean {
    const stakeholder = this.getStakeholderById(stakeholderId);
    if (!stakeholder) return false;

    // Verificar si está en blackout dates
    const isBlackedOut = stakeholder.blackoutDates.some(blackout =>
      dateTime >= blackout.startDate && dateTime <= blackout.endDate
    );
    if (isBlackedOut) return false;

    // Verificar horario laboral
    const dayOfWeek = dateTime.getDay();
    const timeString = dateTime.toTimeString().substring(0, 5); // HH:mm
    
    const workingHours = this.getWorkingHoursForDay(stakeholder.workingHours, dayOfWeek);
    if (!workingHours.isWorkingDay) return false;
    
    return timeString >= workingHours.start && timeString <= workingHours.end;
  }

  private getWorkingHoursForDay(workingHours: any, dayOfWeek: number): any {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return workingHours[days[dayOfWeek]] || { start: '00:00', end: '00:00', isWorkingDay: false };
  }

  // Métodos para agendamiento automático
  async findOptimalSlots(request: SchedulingRequest): Promise<SuggestedSlot[]> {
    const slots: SuggestedSlot[] = [];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + request.maxDaysAhead * 24 * 60 * 60 * 1000);

    // Algoritmo simplificado para encontrar slots óptimos
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Saltar fines de semana si no están permitidos
      if (!request.allowWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }

      // Buscar slots en horarios preferidos
      for (const preference of request.preferredTimeSlots) {
        const slotStart = new Date(date);
        const [startHour, startMinute] = preference.startTime.split(':').map(Number);
        slotStart.setHours(startHour, startMinute, 0, 0);

        const slotEnd = new Date(slotStart.getTime() + request.duration * 60 * 1000);

        // Verificar disponibilidad de participantes requeridos
        const availableAttendees = request.requiredAttendees.filter(attendeeId =>
          this.isCurrentlyAvailable(attendeeId, slotStart)
        );

        const conflictingAttendees = request.requiredAttendees.filter(attendeeId =>
          !this.isCurrentlyAvailable(attendeeId, slotStart)
        );

        // Calcular score basado en disponibilidad y preferencias
        let score = 0;
        score += (availableAttendees.length / request.requiredAttendees.length) * 50;
        score += preference.weight * 5;
        score -= conflictingAttendees.length * 10;

        if (score > 30) { // Solo incluir slots con score decente
          slots.push({
            id: `slot-${date.getTime()}-${startHour}`,
            startTime: slotStart,
            endTime: slotEnd,
            score: Math.min(100, Math.max(0, score)),
            availableAttendees,
            conflictingAttendees,
            reasons: this.generateSlotReasons(availableAttendees, conflictingAttendees, preference.weight)
          });
        }
      }
    }

    // Ordenar por score descendente y tomar los mejores
    return slots.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private generateSlotReasons(available: string[], conflicting: string[], weight: number): string[] {
    const reasons: string[] = [];
    
    if (available.length > 0) {
      reasons.push(`${available.length} participante(s) disponible(s)`);
    }
    
    if (conflicting.length === 0) {
      reasons.push('Sin conflictos de horario');
    } else {
      reasons.push(`${conflicting.length} conflicto(s) detectado(s)`);
    }
    
    if (weight >= 8) {
      reasons.push('Horario altamente preferido');
    } else if (weight >= 6) {
      reasons.push('Horario preferido');
    }
    
    return reasons;
  }

  // Métodos para crear y gestionar reuniones
  async scheduleSlot(request: SchedulingRequest, selectedSlot: SuggestedSlot): Promise<Meeting> {
    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: request.title,
      description: request.description,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      location: 'Por definir',
      meetingType: request.meetingType,
      organizer: request.requesterId,
      attendees: request.requiredAttendees.map(id => {
        const stakeholder = this.getStakeholderById(id);
        return {
          stakeholderId: id,
          stakeholderName: stakeholder?.name || 'Unknown',
          email: stakeholder?.email || '',
          status: 'pending'
        };
      }),
      status: 'scheduled',
      priority: request.priority,
      allowRescheduling: true,
      requiresConfirmation: true,
      sendReminders: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: request.requesterId
    };

    // Actualizar signals
    this.meetingsSignal.update(current => [...current, meeting]);
    
    // Actualizar request status
    this.schedulingRequestsSignal.update(current =>
      current.map(req => req.id === request.id 
        ? { ...req, status: 'scheduled', selectedSlot }
        : req
      )
    );

    return meeting;
  }

  // Métodos para análisis y reportes
  async getStakeholderAnalytics(stakeholderId: string, startDate: Date, endDate: Date): Promise<StakeholderAnalytics> {
    const stakeholder = this.getStakeholderById(stakeholderId);
    if (!stakeholder) {
      throw new Error('Stakeholder not found');
    }

    const stakeholderMeetings = this.meetings().filter(m =>
      m.attendees.some(a => a.stakeholderId === stakeholderId) &&
      m.startTime >= startDate &&
      m.startTime <= endDate
    );

    return {
      stakeholderId,
      period: { startDate, endDate },
      metrics: {
        totalMeetings: stakeholderMeetings.length,
        averageMeetingDuration: this.calculateAverageDuration(stakeholderMeetings),
        responseRate: this.calculateResponseRate(stakeholderId, stakeholderMeetings),
        averageResponseTime: stakeholder.averageResponseTime,
        noShowRate: this.calculateNoShowRate(stakeholderId, stakeholderMeetings),
        reschedulingRate: this.calculateReschedulingRate(stakeholderId, stakeholderMeetings),
        preferredMeetingTypes: this.getPreferredMeetingTypes(stakeholderMeetings),
        preferredTimeSlots: this.getPreferredTimeSlots(stakeholderMeetings),
        busyDays: this.getBusyDays(stakeholderMeetings)
      }
    };
  }

  private calculateAverageDuration(meetings: Meeting[]): number {
    if (meetings.length === 0) return 0;
    const totalDuration = meetings.reduce((sum, meeting) =>
      sum + (meeting.endTime.getTime() - meeting.startTime.getTime()), 0
    );
    return totalDuration / meetings.length / (1000 * 60); // en minutos
  }

  private calculateResponseRate(stakeholderId: string, meetings: Meeting[]): number {
    const responses = meetings.filter(m =>
      m.attendees.some(a => a.stakeholderId === stakeholderId && a.status !== 'pending')
    );
    return meetings.length > 0 ? (responses.length / meetings.length) * 100 : 0;
  }

  private calculateNoShowRate(stakeholderId: string, meetings: Meeting[]): number {
    const noShows = meetings.filter(m =>
      m.status === 'no_show' && m.attendees.some(a => a.stakeholderId === stakeholderId)
    );
    return meetings.length > 0 ? (noShows.length / meetings.length) * 100 : 0;
  }

  private calculateReschedulingRate(stakeholderId: string, meetings: Meeting[]): number {
    const rescheduled = meetings.filter(m =>
      m.status === 'rescheduled' && m.attendees.some(a => a.stakeholderId === stakeholderId)
    );
    return meetings.length > 0 ? (rescheduled.length / meetings.length) * 100 : 0;
  }

  private getPreferredMeetingTypes(meetings: Meeting[]): { type: MeetingType; count: number }[] {
    const typeCount = new Map<MeetingType, number>();
    meetings.forEach(m => {
      typeCount.set(m.meetingType, (typeCount.get(m.meetingType) || 0) + 1);
    });
    return Array.from(typeCount.entries()).map(([type, count]) => ({ type, count }));
  }

  private getPreferredTimeSlots(meetings: Meeting[]): { hour: number; count: number }[] {
    const hourCount = new Map<number, number>();
    meetings.forEach(m => {
      const hour = m.startTime.getHours();
      hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
    });
    return Array.from(hourCount.entries()).map(([hour, count]) => ({ hour, count }));
  }

  private getBusyDays(meetings: Meeting[]): { date: Date; meetingCount: number }[] {
    const dayCount = new Map<string, number>();
    meetings.forEach(m => {
      const dateKey = m.startTime.toDateString();
      dayCount.set(dateKey, (dayCount.get(dateKey) || 0) + 1);
    });
    return Array.from(dayCount.entries()).map(([dateStr, count]) => ({
      date: new Date(dateStr),
      meetingCount: count
    }));
  }

  // Métodos para refrescar datos
  async refreshData(): Promise<void> {
    await this.loadStakeholders();
  }

  // Getters para compatibilidad con componentes
  getAllStakeholders() {
    return this.stakeholders();
  }

  getUpcomingMeetings() {
    return this.upcomingMeetings();
  }

  getPendingSchedulingRequests() {
    return this.pendingSchedulingRequests();
  }

  getSchedulingEfficiency() {
    return this.schedulingEfficiency();
  }
}
