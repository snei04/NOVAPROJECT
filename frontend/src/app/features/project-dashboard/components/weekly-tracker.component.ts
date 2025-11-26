import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weekly-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="weekly-tracker">
      <!-- Header con estado -->
      <div class="tracker-header">
        <div class="header-left">
          <h3 class="tracker-title">📅 Weekly Tracking Obligatorio</h3>
          <p class="tracker-subtitle">Solución al problema de IMEVI: solo 3 registros en 9 semanas</p>
        </div>
        <div class="header-right">
          <div class="status-indicator" [class]="getStatusClass()">
            <span class="status-icon">{{ getStatusIcon() }}</span>
            <span class="status-text">{{ getStatusText() }}</span>
          </div>
        </div>
      </div>

      <!-- Próximo deadline -->
      <div class="deadline-alert" [class.overdue]="isOverdue" [class.warning]="isNearDeadline()">
        <div class="alert-content">
          <span class="alert-icon">{{ isOverdue ? '🚨' : '⏰' }}</span>
          <div class="alert-text">
            <p class="alert-title">
              {{ isOverdue ? 'Reporte Vencido' : 'Próximo Reporte' }}
            </p>
            <p class="alert-date">
              Fecha límite: {{ nextDeadline | date:'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
        </div>
        @if (isOverdue) {
          <button class="btn-urgent" (click)="startNewReport()">
            📝 Crear Reporte Urgente
          </button>
        } @else {
          <button class="btn-primary" (click)="startNewReport()">
            📋 Crear Reporte Semanal
          </button>
        }
      </div>

      <!-- Estadísticas de reporte -->
      <div class="reporting-stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ weeklyReports.length }}</div>
            <div class="stat-label">Reportes Enviados</div>
            <div class="stat-comparison">vs IMEVI: +{{ ((weeklyReports.length / 3) * 100 - 100).toFixed(0) }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getOnTimeReports() }}</div>
            <div class="stat-label">A Tiempo</div>
            <div class="stat-comparison">{{ getEfficiencyPercentage() }}% eficiencia</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getCurrentWeekNumber() }}</div>
            <div class="stat-label">Semana Actual</div>
            <div class="stat-comparison">Año {{ getCurrentYear() }}</div>
          </div>
        </div>
      </div>

      <!-- Lista de reportes recientes -->
      <div class="recent-reports">
        <h4 class="reports-title">📊 Reportes Recientes</h4>
        @if (weeklyReports.length > 0) {
          <div class="reports-list">
            @for (report of getRecentReports(); track report.id) {
              <div class="report-item" [class]="getReportStatusClass(report)">
                <div class="report-header">
                  <div class="report-info">
                    <h5 class="report-title">Semana {{ report.weekNumber }} - {{ report.year }}</h5>
                    <p class="report-date">{{ report.startDate | date:'dd/MM' }} - {{ report.endDate | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <div class="report-status">
                    <span class="status-badge" [class]="'status-' + report.status">
                      {{ getStatusLabel(report.status) }}
                    </span>
                  </div>
                </div>
                
                <div class="report-summary">
                  <div class="summary-item">
                    <span class="summary-label">✅ Logros:</span>
                    <span class="summary-value">{{ report.accomplishments?.length || 0 }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">⚠️ Desafíos:</span>
                    <span class="summary-value">{{ report.challenges?.length || 0 }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">🎯 Metas:</span>
                    <span class="summary-value">{{ report.nextWeekGoals?.length || 0 }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">📈 Progreso:</span>
                    <span class="summary-value">{{ report.metricsSnapshot?.progressPercentage || 0 }}%</span>
                  </div>
                </div>
                
                <div class="report-actions">
                  <button class="btn-view" (click)="viewReport(report)">👁️ Ver</button>
                  @if (report.status === 'draft') {
                    <button class="btn-edit" (click)="editReport(report)">✏️ Editar</button>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h5 class="empty-title">No hay reportes aún</h5>
            <p class="empty-description">
              Crea tu primer reporte semanal para comenzar el tracking automático
            </p>
            <button class="btn-primary" (click)="startNewReport()">
              📝 Crear Primer Reporte
            </button>
          </div>
        }
      </div>

      <!-- Recordatorios -->
      <div class="reminders-section">
        <h4 class="reminders-title">🔔 Recordatorios</h4>
        <div class="reminder-options">
          <div class="reminder-option">
            <input type="checkbox" id="email-reminder" [(ngModel)]="emailReminder">
            <label for="email-reminder">📧 Email 2 días antes</label>
          </div>
          <div class="reminder-option">
            <input type="checkbox" id="notification-reminder" [(ngModel)]="notificationReminder">
            <label for="notification-reminder">🔔 Notificación 1 día antes</label>
          </div>
          <div class="reminder-option">
            <input type="checkbox" id="sms-reminder" [(ngModel)]="smsReminder">
            <label for="sms-reminder">📱 SMS día del vencimiento</label>
          </div>
        </div>
        <button class="btn-secondary" (click)="saveReminders()">
          💾 Guardar Recordatorios
        </button>
      </div>
    </div>
  `,
  styles: [`
    .weekly-tracker {
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    .tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .tracker-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .tracker-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0.25rem 0 0 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-indicator.on-time {
      background: #d1fae5;
      color: #065f46;
    }

    .status-indicator.warning {
      background: #fef3c7;
      color: #92400e;
    }

    .status-indicator.overdue {
      background: #fee2e2;
      color: #991b1b;
    }

    .deadline-alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
    }

    .deadline-alert.warning {
      background: #fffbeb;
      border-color: #fcd34d;
    }

    .deadline-alert.overdue {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .alert-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .alert-icon {
      font-size: 1.5rem;
    }

    .alert-title {
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .alert-date {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0.25rem 0 0 0;
    }

    .btn-primary, .btn-secondary, .btn-urgent {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-urgent {
      background: #ef4444;
      color: white;
      animation: pulse 2s infinite;
    }

    .btn-urgent:hover {
      background: #dc2626;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .reporting-stats {
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0.25rem 0;
    }

    .stat-comparison {
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 500;
    }

    .recent-reports {
      margin-bottom: 2rem;
    }

    .reports-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 1rem;
    }

    .reports-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .report-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      background: #fafafa;
    }

    .report-item.overdue {
      border-color: #fca5a5;
      background: #fef2f2;
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .report-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .report-date {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0.25rem 0 0 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-submitted {
      background: #d1fae5;
      color: #065f46;
    }

    .status-approved {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-draft {
      background: #fef3c7;
      color: #92400e;
    }

    .status-overdue {
      background: #fee2e2;
      color: #991b1b;
    }

    .report-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
    }

    .summary-label {
      color: #6b7280;
    }

    .summary-value {
      font-weight: 600;
      color: #111827;
    }

    .report-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn-view, .btn-edit {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-view {
      background: #e0e7ff;
      color: #3730a3;
    }

    .btn-view:hover {
      background: #c7d2fe;
    }

    .btn-edit {
      background: #fef3c7;
      color: #92400e;
    }

    .btn-edit:hover {
      background: #fde68a;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .empty-description {
      margin-bottom: 1.5rem;
    }

    .reminders-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 1.5rem;
    }

    .reminders-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 1rem;
    }

    .reminder-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .reminder-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .reminder-option input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
    }

    .reminder-option label {
      font-size: 0.875rem;
      color: #374151;
      cursor: pointer;
    }
  `]
})
export class WeeklyTrackerComponent {
  @Input() weeklyReports: any[] = [];
  @Input() nextDeadline: Date = new Date();
  @Input() isOverdue: boolean = false;
  @Output() reportSubmit = new EventEmitter<any>();
  @Output() reminderSet = new EventEmitter<any>();

  // Configuración de recordatorios
  emailReminder = signal(true);
  notificationReminder = signal(true);
  smsReminder = signal(false);

  getStatusClass(): string {
    if (this.isOverdue) return 'overdue';
    if (this.isNearDeadline()) return 'warning';
    return 'on-time';
  }

  getStatusIcon(): string {
    if (this.isOverdue) return '🚨';
    if (this.isNearDeadline()) return '⚠️';
    return '✅';
  }

  getStatusText(): string {
    if (this.isOverdue) return 'Reporte Vencido';
    if (this.isNearDeadline()) return 'Próximo a Vencer';
    return 'Al Día';
  }

  isNearDeadline(): boolean {
    const now = new Date();
    const deadline = new Date(this.nextDeadline);
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 48 && diffHours > 0; // Menos de 48 horas
  }

  getCurrentWeekNumber(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getOnTimeReports(): number {
    return this.weeklyReports.filter(report => report.status !== 'overdue').length;
  }

  getEfficiencyPercentage(): number {
    if (this.weeklyReports.length === 0) return 0;
    return Math.round((this.getOnTimeReports() / this.weeklyReports.length) * 100);
  }

  getRecentReports(): any[] {
    return this.weeklyReports
      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
      .slice(0, 5);
  }

  getReportStatusClass(report: any): string {
    return report.status === 'overdue' ? 'overdue' : '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Borrador',
      'submitted': 'Enviado',
      'approved': 'Aprobado',
      'overdue': 'Vencido'
    };
    return labels[status] || status;
  }

  startNewReport() {
    // Emitir evento para crear nuevo reporte
    this.reportSubmit.emit({
      action: 'create',
      weekNumber: this.getCurrentWeekNumber(),
      year: this.getCurrentYear()
    });
  }

  viewReport(report: any) {
    // Emitir evento para ver reporte
    this.reportSubmit.emit({
      action: 'view',
      report: report
    });
  }

  editReport(report: any) {
    // Emitir evento para editar reporte
    this.reportSubmit.emit({
      action: 'edit',
      report: report
    });
  }

  saveReminders() {
    const reminderConfig = {
      email: this.emailReminder(),
      notification: this.notificationReminder(),
      sms: this.smsReminder()
    };
    
    this.reminderSet.emit(reminderConfig);
  }
}
