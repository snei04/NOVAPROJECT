import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RiskService } from '../services/risk.service';
import { Risk } from '../models/risk.model';

@Component({
  selector: 'app-risk-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="risk-matrix-container p-6">
      <!-- Header -->
      <div class="matrix-header mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">🎯 Matriz de Riesgos 5x5</h2>
        <p class="text-gray-600">
          Visualización interactiva de riesgos por probabilidad e impacto
        </p>
      </div>

      <!-- Matriz 5x5 -->
      <div class="matrix-container mb-8">
        <div class="matrix-grid">
          <!-- Header row -->
          <div class="matrix-cell matrix-header"></div>
          <div class="matrix-cell matrix-header">Muy Bajo</div>
          <div class="matrix-cell matrix-header">Bajo</div>
          <div class="matrix-cell matrix-header">Medio</div>
          <div class="matrix-cell matrix-header">Alto</div>
          <div class="matrix-cell matrix-header">Muy Alto</div>

          <!-- Probability rows -->
          @for (prob of [5, 4, 3, 2, 1]; track prob) {
            <div class="matrix-cell matrix-label">
              {{ getProbabilityLabel(prob) }}
            </div>
            @for (impact of [1, 2, 3, 4, 5]; track impact) {
              <div 
                class="matrix-cell"
                [class]="getRiskCellClass(prob, impact)"
                (click)="selectCell(prob, impact)"
                [title]="'Probabilidad: ' + getProbabilityLabel(prob) + ', Impacto: ' + getImpactLabel(impact)"
              >
                <div class="cell-risks">
                  @if (getRisksInCell(prob, impact).length > 0) {
                    <div class="risk-count">{{ getRisksInCell(prob, impact).length }}</div>
                    @for (risk of getRisksInCell(prob, impact).slice(0, 2); track risk.id) {
                      <div class="risk-dot" [title]="risk.title">
                        {{ risk.title.substring(0, 3) }}
                      </div>
                    }
                    @if (getRisksInCell(prob, impact).length > 2) {
                      <div class="risk-more">+{{ getRisksInCell(prob, impact).length - 2 }}</div>
                    }
                  } @else {
                    <div class="risk-count">0</div>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Riesgos seleccionados -->
      @if (selectedCell() && getRisksInCell(selectedCell()!.probability, selectedCell()!.impact).length > 0) {
        <div class="selected-risks mb-8">
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              📋 Riesgos en celda: {{ getProbabilityLabel(selectedCell()!.probability) }} / {{ getImpactLabel(selectedCell()!.impact) }}
            </h3>
            
            <div class="risks-list space-y-4">
              @for (risk of getRisksInCell(selectedCell()!.probability, selectedCell()!.impact); track risk.id) {
                <div class="risk-card bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-900">{{ risk.title }}</h4>
                    <div class="risk-score-badge" [class]="getScoreClass(risk.riskScore)">
                      {{ risk.riskScore }}
                    </div>
                  </div>
                  
                  <p class="text-sm text-gray-600 mb-3">{{ risk.description }}</p>
                  
                  <div class="risk-actions flex space-x-2">
                    <button 
                      class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                      (click)="viewRiskDetails(risk)"
                    >
                      👁️ Ver Detalles
                    </button>
                    <button 
                      class="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700"
                      (click)="viewRiskControls(risk)"
                    >
                      🛡️ Controles
                    </button>
                    @if (risk.riskScore >= 15) {
                      <button 
                        class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        (click)="escalateRisk(risk)"
                      >
                        🚨 Escalar
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Comparación IMEVI -->
      <div class="imevi-comparison">
        <div class="bg-gradient-to-r from-red-50 to-green-50 border border-orange-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Impacto vs Gestión Reactiva IMEVI</h3>
          <div class="comparison-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="imevi-before">
              <h4 class="font-medium text-red-800 mb-2">❌ IMEVI - Gestión Reactiva</h4>
              <p class="text-sm text-red-700">Solo seguimiento semanal</p>
              <p class="text-sm text-red-700">→ 90% efectividad perdida</p>
            </div>
            
            <div class="novaproject-after">
              <h4 class="font-medium text-green-800 mb-2">✅ NovaProject - Scoring Automático</h4>
              <p class="text-sm text-green-700">→ Escalation automática por reglas</p>
              <p class="text-sm text-green-700">→ -70% tiempo respuesta</p>
            </div>
          </div>
          
          <div class="improvement-metrics mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-green-600">-40%</p>
                <p class="text-sm text-green-700">Retrasos esperados</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">+90%</p>
                <p class="text-sm text-green-700">Cobertura riesgos</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">-70%</p>
                <p class="text-sm text-green-700">Tiempo respuesta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .risk-matrix-container {
      animation: fadeIn 0.6s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .matrix-grid {
      display: grid;
      grid-template-columns: 80px repeat(5, 1fr);
      grid-template-rows: 40px repeat(5, 80px);
      gap: 2px;
      background: #f3f4f6;
      border-radius: 8px;
      padding: 8px;
      max-width: 800px;
    }
    
    .matrix-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }
    
    .matrix-cell:hover {
      transform: scale(1.05);
      z-index: 10;
    }
    
    .matrix-header {
      background: #374151;
      color: white;
      font-size: 0.625rem;
    }
    
    .matrix-label {
      background: #6b7280;
      color: white;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 0.625rem;
    }
    
    .risk-cell-very-low {
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      color: #065f46;
      border: 2px solid #10b981;
    }
    
    .risk-cell-low {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      border: 2px solid #f59e0b;
    }
    
    .risk-cell-medium {
      background: linear-gradient(135deg, #fed7aa, #fdba74);
      color: #9a3412;
      border: 2px solid #ea580c;
    }
    
    .risk-cell-high {
      background: linear-gradient(135deg, #fecaca, #fca5a5);
      color: #991b1b;
      border: 2px solid #dc2626;
    }
    
    .risk-cell-very-high {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      color: #7f1d1d;
      border: 2px solid #b91c1c;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
      50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
    }
    
    .cell-risks {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }
    
    .risk-count {
      font-size: 1rem;
      font-weight: bold;
      color: #374151;
      margin-bottom: 2px;
    }
    
    .risk-dot {
      font-size: 0.5rem;
      background: rgba(0, 0, 0, 0.1);
      color: #6b7280;
      border-radius: 2px;
      padding: 1px 2px;
      text-align: center;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .risk-more {
      font-size: 0.5rem;
      color: #6b7280;
      font-style: italic;
    }
    
    .risk-card {
      transition: all 0.2s ease;
    }
    
    .risk-card:hover {
      transform: translateY(-2px);
    }
    
    .risk-score-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .score-critical {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .score-high {
      background: #fed7aa;
      color: #9a3412;
    }
    
    .score-medium {
      background: #fef3c7;
      color: #92400e;
    }
    
    .score-low {
      background: #d1fae5;
      color: #166534;
    }
  `]
})
export class RiskMatrixComponent implements OnInit {
  private riskService = inject(RiskService);

  // Signals para estado local
  selectedRisks = signal<Risk[]>([]);
  selectedCell = signal<{probability: number, impact: number} | null>(null);

  // Computed signals
  allRisks = computed(() => this.riskService.getAllRisks());

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    await this.riskService.refreshData();
  }

  selectCell(probability: number, impact: number) {
    this.selectedCell.set({ probability, impact });
  }

  getRisksInCell(probability: number, impact: number): Risk[] {
    return this.allRisks().filter(risk => 
      risk.probability === probability && risk.impact === impact
    );
  }

  getRiskCellClass(probability: number, impact: number): string {
    const score = probability * impact;
    
    if (score >= 20) return 'risk-cell-very-high';
    if (score >= 15) return 'risk-cell-high';
    if (score >= 10) return 'risk-cell-medium';
    if (score >= 5) return 'risk-cell-low';
    return 'risk-cell-very-low';
  }

  getScoreClass(score: number): string {
    if (score >= 20) return 'score-critical';
    if (score >= 15) return 'score-high';
    if (score >= 10) return 'score-medium';
    return 'score-low';
  }

  getProbabilityLabel(prob: number): string {
    const labels = {
      1: 'Muy Bajo',
      2: 'Bajo', 
      3: 'Medio',
      4: 'Alto',
      5: 'Muy Alto'
    };
    return labels[prob as keyof typeof labels] || '';
  }

  getImpactLabel(impact: number): string {
    const labels = {
      1: 'Muy Bajo',
      2: 'Bajo',
      3: 'Medio', 
      4: 'Alto',
      5: 'Muy Alto'
    };
    return labels[impact as keyof typeof labels] || '';
  }

  viewRiskDetails(risk: Risk) {
    console.log('Viewing risk details:', risk.title);
    // Implementar modal de detalles
  }

  viewRiskControls(risk: Risk) {
    console.log('Viewing risk controls:', risk.title);
    // Implementar modal de controles
  }

  escalateRisk(risk: Risk) {
    console.log('Escalating risk:', risk.title);
    // Implementar escalation manual - por ahora solo log
    // this.riskService.triggerEscalation requiere más parámetros
  }
}
