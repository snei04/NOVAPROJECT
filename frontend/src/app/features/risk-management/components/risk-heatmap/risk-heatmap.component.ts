import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Risk } from '../../services/risk.service';

@Component({
  selector: 'app-risk-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full aspect-square bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <h3 class="text-center font-bold mb-4 dark:text-white text-sm">Matriz de Riesgos</h3>
      
      <div class="flex h-[300px]">
        <!-- Eje Y Label -->
        <div class="w-6 flex items-center justify-center">
          <span class="-rotate-90 font-semibold text-xs text-gray-500 whitespace-nowrap">Probabilidad</span>
        </div>
        
        <div class="flex-1 flex flex-col">
          <!-- Grid 5x5 -->
          <div class="flex-1 grid grid-cols-5 grid-rows-5 gap-1">
              <!-- Celdas: P=5 (top) to P=1 (bottom) -->
              <div *ngFor="let cell of cells" 
                   class="relative rounded transition-all hover:ring-2 ring-inset ring-white/50"
                   [style.backgroundColor]="getCellColor(cell.p, cell.i)">
                   
                   <!-- Contador de Riesgos -->
                   <div class="absolute inset-0 flex items-center justify-center">
                      <div *ngIf="getRisksInCell(cell.p, cell.i).length > 0" 
                           class="w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm text-xs font-bold text-gray-800 dark:text-gray-200 cursor-help group relative">
                           {{ getRisksInCell(cell.p, cell.i).length }}
                           
                           <!-- Tooltip -->
                           <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded z-20 pointer-events-none">
                              <div *ngFor="let r of getRisksInCell(cell.p, cell.i)" class="truncate mb-1">• {{r.title}}</div>
                           </div>
                      </div>
                   </div>
              </div>
          </div>
          
          <!-- Eje X Label -->
          <div class="h-6 flex items-center justify-center mt-1">
            <span class="font-semibold text-xs text-gray-500">Impacto</span>
          </div>
        </div>
      </div>
      
      <!-- Leyenda -->
      <div class="flex justify-between mt-2 px-8 text-[10px] text-gray-400">
         <span>Bajo</span>
         <span>Alto</span>
      </div>
    </div>
  `
})
export class RiskHeatmapComponent {
  @Input() risks: Risk[] = [];
  
  // Generamos celdas: Probabilidad 5->1, Impacto 1->5
  cells: {p: number, i: number}[] = [];

  constructor() {
    for(let p = 5; p >= 1; p--) {
      for(let i = 1; i <= 5; i++) {
        this.cells.push({p, i});
      }
    }
  }

  getRisksInCell(p: number, i: number): Risk[] {
    return this.risks.filter(r => r.probability === p && r.impact === i);
  }

  getCellColor(p: number, i: number): string {
    const score = p * i;
    // Paleta semáforo suave
    if (score >= 15) return 'rgba(239, 68, 68, 0.8)'; // Rojo (Alto Riesgo)
    if (score >= 8) return 'rgba(249, 115, 22, 0.7)'; // Naranja
    if (score >= 4) return 'rgba(234, 179, 8, 0.6)'; // Amarillo
    return 'rgba(34, 197, 94, 0.5)'; // Verde (Bajo Riesgo)
  }
}
