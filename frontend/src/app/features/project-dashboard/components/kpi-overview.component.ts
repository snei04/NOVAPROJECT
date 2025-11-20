import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-overview">
      <div class="overview-header">
        <h3 class="text-lg font-semibold text-gray-900">📊 Resumen Ejecutivo</h3>
        <p class="text-sm text-gray-600">Comparación directa con problemas identificados en IMEVI</p>
      </div>
      
      <div class="kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <!-- Seguimiento -->
        <div class="kpi-item bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-800">Seguimiento</p>
              <p class="text-xs text-green-600">vs IMEVI: 3 registros/9 semanas</p>
            </div>
            <span class="text-2xl">📈</span>
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-green-900">Automático</p>
            <p class="text-xs text-green-600">+2100% mejora</p>
          </div>
        </div>

        <!-- Gestión de Riesgos -->
        <div class="kpi-item bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-800">Gestión de Riesgos</p>
              <p class="text-xs text-blue-600">vs IMEVI: Reactiva</p>
            </div>
            <span class="text-2xl">⚠️</span>
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-blue-900">Proactiva</p>
            <p class="text-xs text-blue-600">-40% retrasos</p>
          </div>
        </div>

        <!-- Stakeholders -->
        <div class="kpi-item bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-purple-800">Stakeholders</p>
              <p class="text-xs text-purple-600">vs IMEVI: Coordinación manual</p>
            </div>
            <span class="text-2xl">👥</span>
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-purple-900">Inteligente</p>
            <p class="text-xs text-purple-600">+50% optimización</p>
          </div>
        </div>

        <!-- Calidad -->
        <div class="kpi-item bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-orange-800">Calidad</p>
              <p class="text-xs text-orange-600">vs IMEVI: Sin criterios</p>
            </div>
            <span class="text-2xl">✅</span>
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-orange-900">Tracking Auto</p>
            <p class="text-xs text-orange-600">+30% calidad</p>
          </div>
        </div>
      </div>

      <!-- ROI Summary -->
      <div class="roi-summary mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-semibold text-gray-900">💰 ROI Estimado</h4>
            <p class="text-sm text-gray-600">Basado en proyecto IMEVI ($17.400.000 COP)</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-green-600">$5.220.000</p>
            <p class="text-sm text-green-600">30% ahorro en costos</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-overview {
      animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .kpi-item {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class KpiOverviewComponent {
  @Input() projectMetrics: any;
  @Input() comparisonData: any;
}
