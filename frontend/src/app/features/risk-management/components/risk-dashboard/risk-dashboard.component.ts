import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskService, Risk } from '../../services/risk.service';
import { RiskHeatmapComponent } from '../risk-heatmap/risk-heatmap.component';
import { BoardsService } from '../../../../services/boards.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-risk-dashboard',
  standalone: true,
  imports: [CommonModule, RiskHeatmapComponent, FormsModule],
  templateUrl: './risk-dashboard.component.html'
})
export class RiskDashboardComponent implements OnInit {
  private riskService = inject(RiskService);
  private boardsService = inject(BoardsService);

  projects: any[] = [];
  selectedProject: any = null;
  risks: Risk[] = [];
  
  // Modal State
  showModal = false;
  isSaving = false;
  newRisk: Partial<Risk> = {
    title: '',
    description: '',
    probability: 3,
    impact: 3
  };

  ngOnInit() {
    this.boardsService.loadBoards().subscribe(boards => {
      this.projects = boards;
      if(boards.length > 0) this.selectProject(boards[0]);
    });
  }

  selectProject(project: any) {
    this.selectedProject = project;
    this.loadRisks();
  }

  loadRisks() {
    if(!this.selectedProject) return;
    this.riskService.getRisksByProject(this.selectedProject.id).subscribe(risks => {
        this.risks = risks;
    });
  }

  openModal() {
    this.newRisk = { 
        projectId: this.selectedProject.id, 
        title: '',
        description: '',
        probability: 3, 
        impact: 3 
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveRisk() {
    if(!this.newRisk.title || !this.newRisk.projectId) return;
    
    this.isSaving = true;
    this.riskService.createRisk(this.newRisk).subscribe({
        next: (risk) => {
            this.risks.push(risk);
            // Reordenar por severidad descendente
            this.risks.sort((a, b) => (b.severity || 0) - (a.severity || 0));
            this.showModal = false;
            this.isSaving = false;
        },
        error: (err) => {
            console.error(err);
            this.isSaving = false;
            alert('Error al guardar riesgo');
        }
    });
  }

  deleteRisk(risk: Risk) {
    if(!confirm('¿Eliminar este riesgo?')) return;
    if(risk.id) {
        this.riskService.deleteRisk(risk.id).subscribe(() => {
            this.risks = this.risks.filter(r => r.id !== risk.id);
        });
    }
  }
  
  getSeverityClass(severity: number = 0): string {
      if (severity >= 15) return 'bg-red-100 text-red-800';
      if (severity >= 8) return 'bg-orange-100 text-orange-800';
      if (severity >= 4) return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
  }
  
  getSeverityLabel(severity: number = 0): string {
      if (severity >= 15) return 'Crítico';
      if (severity >= 8) return 'Alto';
      if (severity >= 4) return 'Medio';
      return 'Bajo';
  }
}
