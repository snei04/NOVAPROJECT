export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: StakeholderRole;
  department: string;
  position: string;
  priority: StakeholderPriority;
  avatar?: string;
  
  // Información de contacto
  contactPreferences: ContactPreference[];
  timezone: string;
  language: 'es' | 'en';
  
  // Disponibilidad
  availability: StakeholderAvailability;
  workingHours: WorkingHours;
  blackoutDates: DateRange[];
  
  // Historial de interacciones
  lastInteraction?: Date;
  totalMeetings: number;
  averageResponseTime: number; // en horas
  
  // Configuración de notificaciones
  notificationSettings: NotificationSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface StakeholderAvailability {
  id: string;
  stakeholderId: string;
  availableSlots: AvailabilitySlot[];
  recurringAvailability: RecurringAvailability[];
  lastUpdated: Date;
}

export interface AvailabilitySlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: 'available' | 'busy' | 'tentative' | 'out_of_office';
  meetingType?: MeetingType[];
  location?: string;
  notes?: string;
}

export interface RecurringAvailability {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;
  isActive: boolean;
  exceptions: Date[]; // Fechas donde no aplica
}

export interface WorkingHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string;
  isWorkingDay: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  reminderTiming: number[]; // minutos antes: [1440, 60, 15] = 1 día, 1 hora, 15 min
  escalationEnabled: boolean;
  escalationDelay: number; // horas
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  meetingType: MeetingType;
  
  // Participantes
  organizer: string; // stakeholder ID
  attendees: MeetingAttendee[];
  
  // Estado
  status: MeetingStatus;
  priority: MeetingPriority;
  
  // Configuración
  allowRescheduling: boolean;
  requiresConfirmation: boolean;
  sendReminders: boolean;
  
  // Agenda y resultados
  agenda?: string[];
  outcomes?: string[];
  followUpActions?: FollowUpAction[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MeetingAttendee {
  stakeholderId: string;
  stakeholderName: string;
  email: string;
  status: AttendeeStatus;
  responseDate?: Date;
  notes?: string;
}

export interface FollowUpAction {
  id: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface SchedulingRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  title: string;
  description: string;
  duration: number; // minutos
  meetingType: MeetingType;
  priority: MeetingPriority;
  
  // Participantes requeridos
  requiredAttendees: string[]; // stakeholder IDs
  optionalAttendees: string[];
  
  // Preferencias de horario
  preferredTimeSlots: TimeSlotPreference[];
  deadline: Date; // fecha límite para agendar
  
  // Configuración
  allowWeekends: boolean;
  minNoticeHours: number;
  maxDaysAhead: number;
  
  // Estado
  status: SchedulingStatus;
  suggestedSlots: SuggestedSlot[];
  selectedSlot?: SuggestedSlot;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlotPreference {
  dayOfWeek?: number; // 0-6, opcional
  startTime: string; // HH:mm
  endTime: string;
  weight: number; // 1-10, prioridad
}

export interface SuggestedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  score: number; // 0-100, qué tan bueno es el slot
  availableAttendees: string[];
  conflictingAttendees: string[];
  reasons: string[]; // Por qué es buena/mala opción
}

// Enums y tipos
export type StakeholderRole = 
  | 'executive' 
  | 'manager' 
  | 'team_lead' 
  | 'developer' 
  | 'designer' 
  | 'analyst' 
  | 'consultant' 
  | 'client' 
  | 'vendor' 
  | 'other';

export type StakeholderPriority = 'critical' | 'high' | 'medium' | 'low';

export type ContactPreference = 'email' | 'phone' | 'teams' | 'slack' | 'whatsapp';

export type MeetingType = 
  | 'interview' 
  | 'review' 
  | 'planning' 
  | 'standup' 
  | 'retrospective' 
  | 'demo' 
  | 'training' 
  | 'one_on_one' 
  | 'workshop';

export type MeetingStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'rescheduled' 
  | 'no_show';

export type MeetingPriority = 'urgent' | 'high' | 'normal' | 'low';

export type AttendeeStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'tentative' 
  | 'no_response';

export type SchedulingStatus = 
  | 'pending' 
  | 'processing' 
  | 'options_available' 
  | 'scheduled' 
  | 'failed' 
  | 'cancelled' 
  | 'expired';

// Interfaces para análisis y reportes
export interface StakeholderAnalytics {
  stakeholderId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    totalMeetings: number;
    averageMeetingDuration: number;
    responseRate: number; // % de respuestas a invitaciones
    averageResponseTime: number; // horas
    noShowRate: number;
    reschedulingRate: number;
    preferredMeetingTypes: { type: MeetingType; count: number }[];
    preferredTimeSlots: { hour: number; count: number }[];
    busyDays: { date: Date; meetingCount: number }[];
  };
}

export interface SchedulingEfficiency {
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    totalRequests: number;
    successfulScheduling: number;
    averageTimeToSchedule: number; // horas
    firstOptionAcceptanceRate: number;
    averageOptionsProvided: number;
    conflictResolutionTime: number; // horas
    stakeholderSatisfactionScore: number; // 1-10
  };
  improvements: {
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }[];
}
