import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BoardsService } from '../../services/boards.service';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { BudgetService, BudgetSummary } from '@services/budget.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private dashboardService = inject(DashboardService);
  private budgetService = inject(BudgetService);
  private router = inject(Router);

  projects: any[] = [];
  selectedProject: any = null;
  dashboardData: DashboardData | null = null;
  budgetSummary: BudgetSummary | null = null;
  loading = false;


  // Weekly Report Modal
  showReportModal = false;
  modalMode: 'create' | 'view' = 'create';
  newReport = {
    achievements: '',
    challenges: '',
    goals: ''
  };
  
  weekStatus: { week: number, status: 'done' | 'missed' | 'current' | 'future' }[] = [];

  // Export Menu
  showExportMenu = false;

  ngOnInit() {
    this.boardsService.loadBoards().subscribe(boards => {
      this.projects = boards;
      if (boards.length > 0) this.selectProject(boards[0]);
    });
  }

  selectProject(project: any) {
    this.selectedProject = project;
    this.loadDashboard();
  }

  loadDashboard() {
    if (!this.selectedProject) return;
    this.loading = true;
    
    // Cargar datos generales
    this.dashboardService.getDashboard(this.selectedProject.id).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.calculateWeekStatus();
        this.loading = false;
      },
      error: () => this.loading = false
    });

    // Cargar presupuesto
    this.budgetService.getBudgetSummary(this.selectedProject.id).subscribe({
      next: (summary) => this.budgetSummary = summary,
      error: (err) => console.error('Error loading budget summary', err)
    });
  }

  calculateWeekStatus() {
    if (!this.dashboardData) return;
    
    const currentWeek = this.getCurrentWeek();
    const reportedWeeks = new Set(this.dashboardData.weeklyReports.history.map(r => r.week_number));
    
    this.weekStatus = [];
    // Generar historial de semanas hasta la actual
    for (let i = 1; i <= currentWeek; i++) {
        let status: 'done' | 'missed' | 'current' | 'future' = 'missed';
        
        if (reportedWeeks.has(i)) {
            status = 'done';
        } else if (i === currentWeek) {
            status = 'current';
        }
        
        this.weekStatus.push({ week: i, status });
    }
  }

  openReportModal() {
    this.modalMode = 'create';
    this.newReport = { achievements: '', challenges: '', goals: '' };
    this.showReportModal = true;
  }

  viewReport(report: any) {
    this.modalMode = 'view';
    this.newReport = {
        achievements: report.achievements,
        challenges: report.challenges,
        goals: report.goals_next_week
    };
    this.showReportModal = true;
  }

  createProject() {
    this.router.navigate(['/app/project-dashboard/create']);
  }

  closeReportModal() {
    this.showReportModal = false;
    this.newReport = { achievements: '', challenges: '', goals: '' };
  }

  submitReport() {
    if (!this.selectedProject) return;
    
    // Permission Check
    if (this.selectedProject.userRole === 'viewer') {
        alert('No tienes permisos para crear reportes.');
        return;
    }

    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    
    this.dashboardService.createWeeklyReport({
      projectId: this.selectedProject.id,
      weekNumber,
      year: now.getFullYear(),
      achievements: this.newReport.achievements,
      challenges: this.newReport.challenges,
      goals: this.newReport.goals,
      progressSnapshot: this.dashboardData?.progress.percent || 0
    }).subscribe({
      next: () => {
        this.closeReportModal();
        this.loadDashboard();
        alert('¡Reporte semanal creado exitosamente!');
      },
      error: (err) => {
        console.error('Error creando reporte:', err);
        const errorMsg = err.error?.message || err.message || 'Error desconocido';
        alert('Error al guardar el reporte: ' + errorMsg);
      }
    });
  }

  toggleExportMenu() {
    this.showExportMenu = !this.showExportMenu;
  }

  exportToExcel() {
    if (!this.dashboardData || !this.selectedProject) return;
    
    // Preparar datos para CSV
    const headers = ['Metrica', 'Valor', 'Detalle', 'Tendencia'];
    const rows = [
      ['Progreso General', `${this.dashboardData.progress.percent}%`, 'Del total del proyecto', this.progressTrend],
      ['Entregables', `${this.dashboardData.progress.deliverables.completed}/${this.dashboardData.progress.deliverables.total}`, 'Completados', 'Estable'],
      ['Riesgos Criticos', this.dashboardData.alerts.criticalRisks, 'Requieren atencion', '-'],
      ['Reportes Semanales', this.dashboardData.weeklyReports.total, 'Enviados', 'Mejorando']
    ];

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_dashboard_${this.selectedProject.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showExportMenu = false;
  }

  exportToPDF() {
    this.showExportMenu = false;
    setTimeout(() => {
        window.print();
    }, 100);
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getCurrentWeek(): number {
    return this.getWeekNumber(new Date());
  }

  getNextReportDeadline(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(23, 59, 0, 0);
    return nextSaturday.toLocaleDateString('es-ES');
  }

  get isReportOnTime(): boolean {
    if (!this.dashboardData?.weeklyReports.lastReport) return false;
    const lastReport = this.dashboardData.weeklyReports.lastReport;
    return lastReport.week_number === this.getCurrentWeek();
  }

  get progressTrend(): string {
    const trend = this.dashboardData?.progress.trend;
    switch (trend) {
        case 'improving': return '↗️ Mejorando';
        case 'worsening': return '↘️ Empeorando';
        default: return '→ Estable';
    }
  }

  get trendColorClass(): string {
    const trend = this.dashboardData?.progress.trend;
    switch (trend) {
        case 'improving': return 'bg-green-100 text-green-800';
        case 'worsening': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }
}
