import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  submittedDate: Date;
  submittedBy: string;
  status: 'draft' | 'submitted' | 'approved' | 'overdue';
  
  // Contenido del reporte
  accomplishments: string[];
  challenges: string[];
  nextWeekGoals: string[];
  riskUpdates: RiskUpdate[];
  metricsSnapshot: {
    progressPercentage: number;
    tasksCompleted: number;
    tasksAdded: number;
    milestonesReached: number;
  };
  
  // Stakeholder updates
  stakeholderMeetings: StakeholderMeeting[];
  upcomingDeadlines: UpcomingDeadline[];
  
  // Quality metrics
  qualityScore: number;
  reviewComments: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskUpdate {
  riskId: string;
  riskTitle: string;
  previousStatus: string;
  currentStatus: string;
  mitigationActions: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface StakeholderMeeting {
  stakeholderId: string;
  stakeholderName: string;
  meetingDate: Date;
  purpose: string;
  outcomes: string[];
  followUpActions: string[];
}

export interface UpcomingDeadline {
  taskId: string;
  taskTitle: string;
  dueDate: Date;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  completionStatus: number; // 0-100%
}

export interface ReportReminder {
  id: string;
  userId: string;
  reminderType: 'email' | 'notification' | 'sms';
  scheduledTime: Date;
  message: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WeeklyTrackingService {
  private http = inject(HttpClient);

  // Signals para estado reactivo
  private weeklyReportsSignal = signal<WeeklyReport[]>([]);
  private currentDraftSignal = signal<Partial<WeeklyReport> | null>(null);
  private remindersSignal = signal<ReportReminder[]>([]);

  // Public readonly signals
  public weeklyReports = this.weeklyReportsSignal.asReadonly();
  public currentDraft = this.currentDraftSignal.asReadonly();
  public reminders = this.remindersSignal.asReadonly();

  // Computed signals
  public currentWeekNumber = computed(() => this.getCurrentWeekNumber());
  public currentYear = computed(() => new Date().getFullYear());
  
  public nextDeadline = computed(() => {
    const weekNumber = this.currentWeekNumber();
    const year = this.currentYear();
    return this.calculateNextDeadline(weekNumber, year);
  });

  public isOverdue = computed(() => {
    const deadline = this.nextDeadline();
    const now = new Date();
    return now > deadline;
  });

  public expectedReportsCount = computed(() => {
    const startDate = new Date('2024-01-15'); // Inicio del proyecto
    const now = new Date();
    const weeksDiff = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, weeksDiff);
  });

  public reportingTrend = computed(() => {
    const reports = this.weeklyReports();
    const expected = this.expectedReportsCount();
    const actual = reports.length;
    
    if (actual >= expected) return 'up';
    if (actual >= expected * 0.8) return 'stable';
    return 'down';
  });

  public reportingEfficiency = computed(() => {
    const reports = this.weeklyReports();
    const onTimeReports = reports.filter(r => {
      const deadline = this.calculateDeadlineForWeek(r.weekNumber, r.year);
      return r.submittedDate <= deadline;
    }).length;
    
    return reports.length > 0 ? (onTimeReports / reports.length) * 100 : 0;
  });

  // Métodos para cargar datos
  async loadWeeklyReports(): Promise<void> {
    try {
      // Mock data - después se conectará a la API real
      const mockReports: WeeklyReport[] = [
        {
          id: 'report-w3-2024',
          weekNumber: 3,
          year: 2024,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-21'),
          submittedDate: new Date('2024-01-22'),
          submittedBy: 'Equipo NovaProject',
          status: 'approved',
          accomplishments: [
            'Completado análisis arquitectónico del proyecto',
            'Creada estructura inicial del dashboard',
            'Definidos KPIs principales'
          ],
          challenges: [
            'Integración con servicios existentes más compleja de lo esperado'
          ],
          nextWeekGoals: [
            'Implementar servicio de métricas',
            'Crear componentes de visualización',
            'Configurar tracking automático'
          ],
          riskUpdates: [
            {
              riskId: 'risk-1',
              riskTitle: 'Complejidad de integración',
              previousStatus: 'medium',
              currentStatus: 'low',
              mitigationActions: ['Refactoring de servicios existentes'],
              impact: 'low'
            }
          ],
          metricsSnapshot: {
            progressPercentage: 15,
            tasksCompleted: 8,
            tasksAdded: 3,
            milestonesReached: 0
          },
          stakeholderMeetings: [
            {
              stakeholderId: 'stakeholder-1',
              stakeholderName: 'Product Owner',
              meetingDate: new Date('2024-01-18'),
              purpose: 'Revisión de progreso inicial',
              outcomes: ['Aprobación de arquitectura propuesta'],
              followUpActions: ['Definir criterios de aceptación detallados']
            }
          ],
          upcomingDeadlines: [
            {
              taskId: 'task-1',
              taskTitle: 'Dashboard de Progreso',
              dueDate: new Date('2024-02-15'),
              assignee: 'Equipo Frontend',
              priority: 'high',
              completionStatus: 60
            }
          ],
          qualityScore: 85,
          reviewComments: ['Buen progreso inicial', 'Mantener foco en KPIs'],
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date('2024-01-22')
        }
      ];

      // Simular llamada a API
      // const reports = await firstValueFrom(
      //   this.http.get<WeeklyReport[]>('/api/projects/nova-v2/weekly-reports')
      // );

      this.weeklyReportsSignal.set(mockReports);
      await this.loadReminders();
      
    } catch (error) {
      console.error('Error loading weekly reports:', error);
      throw error;
    }
  }

  private async loadReminders(): Promise<void> {
    const mockReminders: ReportReminder[] = [
      {
        id: 'reminder-1',
        userId: 'current-user',
        reminderType: 'notification',
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
        message: 'Recordatorio: Reporte semanal vence en 2 días',
        isActive: true
      }
    ];

    this.remindersSignal.set(mockReminders);
  }

  // Métodos para crear y gestionar reportes
  async createWeeklyReport(reportData: Partial<WeeklyReport>): Promise<WeeklyReport> {
    const weekNumber = this.currentWeekNumber();
    const year = this.currentYear();
    
    const newReport: WeeklyReport = {
      id: `report-w${weekNumber}-${year}`,
      weekNumber,
      year,
      startDate: this.getWeekStartDate(weekNumber, year),
      endDate: this.getWeekEndDate(weekNumber, year),
      submittedDate: new Date(),
      submittedBy: 'Current User', // Obtener del contexto de usuario
      status: 'submitted',
      accomplishments: reportData.accomplishments || [],
      challenges: reportData.challenges || [],
      nextWeekGoals: reportData.nextWeekGoals || [],
      riskUpdates: reportData.riskUpdates || [],
      metricsSnapshot: reportData.metricsSnapshot || {
        progressPercentage: 0,
        tasksCompleted: 0,
        tasksAdded: 0,
        milestonesReached: 0
      },
      stakeholderMeetings: reportData.stakeholderMeetings || [],
      upcomingDeadlines: reportData.upcomingDeadlines || [],
      qualityScore: reportData.qualityScore || 0,
      reviewComments: reportData.reviewComments || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Simular llamada a API
      // const createdReport = await firstValueFrom(
      //   this.http.post<WeeklyReport>('/api/weekly-reports', newReport)
      // );

      this.weeklyReportsSignal.update(current => [...current, newReport]);
      return newReport;
      
    } catch (error) {
      console.error('Error creating weekly report:', error);
      throw error;
    }
  }

  async submitWeeklyReport(reportData: any): Promise<void> {
    await this.createWeeklyReport(reportData);
    this.currentDraftSignal.set(null);
  }

  saveDraft(draftData: Partial<WeeklyReport>): void {
    this.currentDraftSignal.set(draftData);
  }

  // Métodos para recordatorios
  async setReminder(reminderData: Partial<ReportReminder>): Promise<void> {
    const newReminder: ReportReminder = {
      id: `reminder-${Date.now()}`,
      userId: 'current-user',
      reminderType: reminderData.reminderType || 'notification',
      scheduledTime: reminderData.scheduledTime || new Date(),
      message: reminderData.message || 'Recordatorio de reporte semanal',
      isActive: true
    };

    try {
      // Simular llamada a API
      // await firstValueFrom(
      //   this.http.post('/api/reminders', newReminder)
      // );

      this.remindersSignal.update(current => [...current, newReminder]);
      
    } catch (error) {
      console.error('Error setting reminder:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  private getCurrentWeekNumber(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  private calculateNextDeadline(weekNumber: number, year: number): Date {
    const weekEnd = this.getWeekEndDate(weekNumber, year);
    // Deadline es el lunes siguiente al final de la semana
    const deadline = new Date(weekEnd);
    deadline.setDate(deadline.getDate() + 1); // Lunes
    deadline.setHours(23, 59, 59, 999); // Final del día
    return deadline;
  }

  private calculateDeadlineForWeek(weekNumber: number, year: number): Date {
    return this.calculateNextDeadline(weekNumber, year);
  }

  private getWeekStartDate(weekNumber: number, year: number): Date {
    const startOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7 - startOfYear.getDay();
    const weekStart = new Date(startOfYear);
    weekStart.setDate(startOfYear.getDate() + daysToAdd);
    return weekStart;
  }

  private getWeekEndDate(weekNumber: number, year: number): Date {
    const weekStart = this.getWeekStartDate(weekNumber, year);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  }

  // Métodos para refrescar datos
  async refreshReports(): Promise<void> {
    await this.loadWeeklyReports();
  }

  // Getters para compatibilidad con el componente
  getWeeklyReports() {
    return this.weeklyReports();
  }

  getExpectedReportsCount() {
    return this.expectedReportsCount();
  }

  getNextDeadline() {
    return this.nextDeadline();
  }

  getIsOverdue() {
    return this.isOverdue();
  }

  getReportingTrend() {
    return this.reportingTrend();
  }

  // Método para generar template de reporte
  generateReportTemplate(): Partial<WeeklyReport> {
    return {
      accomplishments: [],
      challenges: [],
      nextWeekGoals: [],
      riskUpdates: [],
      stakeholderMeetings: [],
      upcomingDeadlines: [],
      metricsSnapshot: {
        progressPercentage: 0,
        tasksCompleted: 0,
        tasksAdded: 0,
        milestonesReached: 0
      },
      qualityScore: 0,
      reviewComments: []
    };
  }
}
