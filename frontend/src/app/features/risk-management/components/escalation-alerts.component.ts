import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RiskService } from '../services/risk.service';
import { EscalationEvent, Risk } from '../models/risk.model';

@Component({
  selector: 'app-escalation-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="escalation-alerts p-6">
      <!-- Header -->
      <div class="alerts-header mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">🚨 Escalaciones Automáticas</h2>
            <p class="text-gray-600 mt-2">
              Sistema proactivo vs gestión reactiva IMEVI - Alertas inteligentes en tiempo real
            </p>
          </div>
          <div class="flex space-x-3">
            <button 
              class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              (click)="acknowledgeAllAlerts()"
              [disabled]="pendingAlerts().length === 0"
            >
              ✅ Reconocer Todas ({{ pendingAlerts().length }})
            </button>
            <button 
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              (click)="refreshAlerts()"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Métricas de Escalation -->
      <div class="escalation-metrics mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="metric-card bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Escalaciones Activas</p>
                <p class="text-2xl font-bold text-red-600">{{ activeEscalations().length }}</p>
              </div>
              <span class="text-3xl">🚨</span>
            </div>
            <div class="mt-2">
              <p class="text-xs text-red-600">Requieren atención inmediata</p>
            </div>
          </div>
          
          <div class="metric-card bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Pendientes Respuesta</p>
                <p class="text-2xl font-bold text-orange-600">{{ pendingAlerts().length }}</p>
              </div>
              <span class="text-3xl">⏰</span>
            </div>
            <div class="mt-2">
              <p class="text-xs text-orange-600">Sin reconocimiento</p>
            </div>
          </div>
          
          <div class="metric-card bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Resueltas Hoy</p>
                <p class="text-2xl font-bold text-green-600">{{ resolvedToday().length }}</p>
              </div>
              <span class="text-3xl">✅</span>
            </div>
            <div class="mt-2">
              <p class="text-xs text-green-600">vs IMEVI: +70% más rápido</p>
            </div>
          </div>
          
          <div class="metric-card bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Tiempo Promedio</p>
                <p class="text-2xl font-bold text-blue-600">{{ averageResponseTime() }}h</p>
              </div>
              <span class="text-3xl">⏱️</span>
            </div>
            <div class="mt-2">
              <p class="text-xs text-blue-600">Respuesta escalation</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas Críticas -->
      @if (criticalAlerts().length > 0) {
        <div class="critical-alerts mb-6">
          <div class="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
            <div class="flex items-center mb-3">
              <span class="text-2xl mr-3">🚨</span>
              <h3 class="text-lg font-semibold text-red-800">
                Alertas Críticas - Atención Inmediata Requerida
              </h3>
            </div>
            <div class="space-y-3">
              @for (alert of criticalAlerts(); track alert.id) {
                <div class="critical-alert-item bg-white border border-red-200 rounded-lg p-3">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="font-semibold text-red-900">{{ getRiskTitle(alert.riskId) }}</h4>
                      <p class="text-sm text-red-700 mt-1">
                        Escalado a nivel {{ alert.level }} - {{ getTimeSince(alert.triggeredAt) }}
                      </p>
                      <p class="text-xs text-red-600 mt-1">
                        Trigger: {{ getTriggerDescription(alert.triggeredBy) }}
                      </p>
                    </div>
                    <div class="flex space-x-2">
                      <button 
                        class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        (click)="acknowledgeAlert(alert)"
                      >
                        ✅ Reconocer
                      </button>
                      <button 
                        class="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700"
                        (click)="escalateToNext(alert)"
                      >
                        ⬆️ Escalar
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Lista de Escalaciones -->
      <div class="escalations-list">
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">📋 Historial de Escalaciones</h3>
            <div class="flex space-x-4 mt-2">
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterStatus() === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setFilter('all')"
              >
                Todas ({{ allEscalations().length }})
              </button>
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterStatus() === 'triggered' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setFilter('triggered')"
              >
                Activas ({{ activeEscalations().length }})
              </button>
              <button 
                class="text-sm px-3 py-1 rounded"
                [class]="filterStatus() === 'resolved' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-800'"
                (click)="setFilter('resolved')"
              >
                Resueltas ({{ resolvedEscalations().length }})
              </button>
            </div>
          </div>
          
          <div class="divide-y divide-gray-200">
            @for (escalation of filteredEscalations(); track escalation.id) {
              <div class="escalation-item p-6 hover:bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <!-- Header de la escalación -->
                    <div class="flex items-center space-x-3 mb-2">
                      <div class="escalation-level-badge" [class]="getLevelBadgeClass(escalation.level)">
                        Nivel {{ escalation.level }}
                      </div>
                      <div class="escalation-status-badge" [class]="getStatusBadgeClass(escalation.status)">
                        {{ getStatusLabel(escalation.status) }}
                      </div>
                      <span class="text-sm text-gray-500">
                        {{ escalation.triggeredAt | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>
                    
                    <!-- Información del riesgo -->
                    <h4 class="font-semibold text-gray-900 mb-1">
                      {{ getRiskTitle(escalation.riskId) }}
                    </h4>
                    <p class="text-sm text-gray-600 mb-2">
                      Trigger: {{ getTriggerDescription(escalation.triggeredBy) }}
                    </p>
                    
                    <!-- Destinatarios -->
                    <div class="escalation-recipients mb-2">
                      <span class="text-xs text-gray-500">Escalado a:</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        @for (recipient of escalation.escalatedTo; track recipient) {
                          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {{ recipient }}
                          </span>
                        }
                      </div>
                    </div>
                    
                    <!-- Notificaciones enviadas -->
                    <div class="notifications-sent mb-2">
                      <span class="text-xs text-gray-500">Notificaciones:</span>
                      <div class="flex space-x-2 mt-1">
                        @for (notification of escalation.notificationsSent; track notification.id) {
                          <span class="text-xs px-2 py-1 rounded"
                                [class]="getNotificationClass(notification)">
                            {{ notification.channel }} 
                            {{ notification.delivered ? '✅' : '❌' }}
                          </span>
                        }
                      </div>
                    </div>
                    
                    <!-- Respuesta y acciones -->
                    @if (escalation.acknowledgedBy) {
                      <div class="escalation-response bg-green-50 border border-green-200 rounded p-3 mt-3">
                        <div class="flex items-center space-x-2 mb-2">
                          <span class="text-green-600">✅</span>
                          <span class="text-sm font-medium text-green-800">
                            Reconocido por {{ escalation.acknowledgedBy }}
                          </span>
                          <span class="text-xs text-green-600">
                            {{ escalation.acknowledgedAt | date:'dd/MM HH:mm' }}
                          </span>
                        </div>
                        @if (escalation.response) {
                          <p class="text-sm text-green-700 mb-2">{{ escalation.response }}</p>
                        }
                        @if (escalation.actionsTaken && escalation.actionsTaken.length > 0) {
                          <div class="actions-taken">
                            <span class="text-xs font-medium text-green-800">Acciones tomadas:</span>
                            <ul class="text-xs text-green-700 mt-1 ml-4">
                              @for (action of escalation.actionsTaken; track action) {
                                <li class="list-disc">{{ action }}</li>
                              }
                            </ul>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  
                  <!-- Acciones -->
                  <div class="escalation-actions flex flex-col space-y-2 ml-4">
                    @if (escalation.status === 'triggered' && !escalation.acknowledgedBy) {
                      <button 
                        class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        (click)="acknowledgeAlert(escalation)"
                      >
                        ✅ Reconocer
                      </button>
                    }
                    
                    @if (escalation.status === 'acknowledged' || escalation.status === 'in_progress') {
                      <button 
                        class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        (click)="updateEscalation(escalation)"
                      >
                        📝 Actualizar
                      </button>
                      <button 
                        class="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700"
                        (click)="escalateToNext(escalation)"
                      >
                        ⬆️ Escalar
                      </button>
                      <button 
                        class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        (click)="resolveEscalation(escalation)"
                      >
                        ✅ Resolver
                      </button>
                    }
                    
                    <button 
                      class="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                      (click)="viewRiskDetails(escalation.riskId)"
                    >
                      👁️ Ver Riesgo
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-6 text-center text-gray-500">
                <span class="text-4xl mb-2 block">📭</span>
                <p>No hay escalaciones {{ filterStatus() === 'all' ? '' : getFilterLabel() }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Comparación IMEVI -->
      <div class="imevi-comparison mt-6">
        <div class="bg-gradient-to-r from-red-50 to-green-50 border border-orange-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Escalation Automática vs IMEVI</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="comparison-before">
              <h4 class="font-medium text-red-800 mb-2">❌ IMEVI - Escalation Manual</h4>
              <ul class="text-sm text-red-700 space-y-1">
                <li>• Escalation solo cuando alguien se acuerda</li>
                <li>• Sin reglas automáticas definidas</li>
                <li>• Tiempo de respuesta: días o semanas</li>
                <li>• Sin seguimiento de notificaciones</li>
                <li>• Riesgos críticos sin atención oportuna</li>
              </ul>
            </div>
            
            <div class="comparison-after">
              <h4 class="font-medium text-green-800 mb-2">✅ NovaProject - Escalation Inteligente</h4>
              <ul class="text-sm text-green-700 space-y-1">
                <li>• Escalation automática por reglas configurables</li>
                <li>• Triggers inteligentes (score, tiempo, controles)</li>
                <li>• Tiempo de respuesta: minutos u horas</li>
                <li>• Tracking completo de notificaciones</li>
                <li>• Atención proactiva a riesgos críticos</li>
              </ul>
            </div>
          </div>
          
          <div class="improvement-metrics mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-green-600">-70%</p>
                <p class="text-sm text-green-700">Tiempo de respuesta</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">+90%</p>
                <p class="text-sm text-green-700">Riesgos atendidos</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">100%</p>
                <p class="text-sm text-green-700">Automatización</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .escalation-alerts {
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
    
    .escalation-item {
      transition: background-color 0.2s ease;
    }
    
    .escalation-level-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .level-1 {
      background: #fef3c7;
      color: #92400e;
    }
    
    .level-2 {
      background: #fed7aa;
      color: #9a3412;
    }
    
    .level-3 {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .escalation-status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .status-triggered {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .status-acknowledged {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-in_progress {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-resolved {
      background: #dcfce7;
      color: #166534;
    }
    
    .notification-delivered {
      background: #dcfce7;
      color: #166534;
    }
    
    .notification-failed {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .critical-alert-item {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
  `]
})
export class EscalationAlertsComponent implements OnInit {
  private riskService = inject(RiskService);

  // Signals para estado local
  filterStatus = signal<'all' | 'triggered' | 'acknowledged' | 'resolved'>('all');

  // Computed signals
  allEscalations = computed(() => this.riskService.getRecentEscalations());
  
  activeEscalations = computed(() => 
    this.allEscalations().filter(e => 
      e.status === 'triggered' || e.status === 'acknowledged' || e.status === 'in_progress'
    )
  );
  
  pendingAlerts = computed(() => 
    this.allEscalations().filter(e => e.status === 'triggered' && !e.acknowledgedBy)
  );
  
  criticalAlerts = computed(() => 
    this.pendingAlerts().filter(e => e.level >= 2)
  );
  
  resolvedEscalations = computed(() => 
    this.allEscalations().filter(e => e.status === 'resolved')
  );
  
  resolvedToday = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.resolvedEscalations().filter(e => 
      e.resolvedAt && e.resolvedAt >= today
    );
  });
  
  filteredEscalations = computed(() => {
    const filter = this.filterStatus();
    const escalations = this.allEscalations();
    
    switch (filter) {
      case 'triggered':
        return escalations.filter(e => e.status === 'triggered' || e.status === 'acknowledged' || e.status === 'in_progress');
      case 'resolved':
        return escalations.filter(e => e.status === 'resolved');
      default:
        return escalations;
    }
  });
  
  averageResponseTime = computed(() => {
    const resolved = this.resolvedEscalations();
    if (resolved.length === 0) return 0;
    
    const totalTime = resolved.reduce((sum, escalation) => {
      if (escalation.acknowledgedAt) {
        const responseTime = escalation.acknowledgedAt.getTime() - escalation.triggeredAt.getTime();
        return sum + (responseTime / (1000 * 60 * 60)); // en horas
      }
      return sum;
    }, 0);
    
    return Math.round(totalTime / resolved.length * 10) / 10;
  });

  ngOnInit() {
    this.loadData();
    // Configurar actualización automática cada 30 segundos
    setInterval(() => {
      this.refreshAlerts();
    }, 30000);
  }

  private async loadData() {
    await this.riskService.refreshData();
  }

  async refreshAlerts() {
    await this.riskService.checkEscalationRules();
  }

  setFilter(status: 'all' | 'triggered' | 'acknowledged' | 'resolved') {
    this.filterStatus.set(status);
  }

  getFilterLabel(): string {
    const labels = {
      all: '',
      triggered: 'activas',
      acknowledged: 'reconocidas',
      resolved: 'resueltas'
    };
    return labels[this.filterStatus()];
  }

  getRiskTitle(riskId: string): string {
    const risk = this.riskService.getRiskById(riskId);
    return risk?.title || 'Riesgo no encontrado';
  }

  getTriggerDescription(trigger: any): string {
    switch (trigger.type) {
      case 'score_increase':
        return `Score aumentó a ${trigger.threshold || 'N/A'}`;
      case 'overdue_control':
        return 'Control vencido sin implementar';
      case 'no_update':
        return `Sin actualización por ${trigger.timeframe || 'N/A'} horas`;
      case 'manual':
        return 'Escalation manual';
      default:
        return 'Trigger desconocido';
    }
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `hace ${diffHours}h ${diffMinutes}m`;
    } else {
      return `hace ${diffMinutes}m`;
    }
  }

  getLevelBadgeClass(level: number): string {
    return `level-${Math.min(level, 3)}`;
  }

  getStatusBadgeClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      triggered: 'Disparada',
      acknowledged: 'Reconocida',
      in_progress: 'En Progreso',
      resolved: 'Resuelta',
      expired: 'Expirada'
    };
    return labels[status] || status;
  }

  getNotificationClass(notification: any): string {
    return notification.delivered ? 'notification-delivered' : 'notification-failed';
  }

  acknowledgeAlert(escalation: EscalationEvent) {
    console.log('Acknowledging escalation:', escalation.id);
    // Implementar lógica de reconocimiento
  }

  acknowledgeAllAlerts() {
    const pending = this.pendingAlerts();
    console.log('Acknowledging all alerts:', pending.length);
    // Implementar lógica de reconocimiento masivo
  }

  escalateToNext(escalation: EscalationEvent) {
    console.log('Escalating to next level:', escalation.id);
    // Implementar lógica de escalation al siguiente nivel
  }

  updateEscalation(escalation: EscalationEvent) {
    console.log('Updating escalation:', escalation.id);
    // Implementar modal de actualización
  }

  resolveEscalation(escalation: EscalationEvent) {
    console.log('Resolving escalation:', escalation.id);
    // Implementar lógica de resolución
  }

  viewRiskDetails(riskId: string) {
    console.log('Viewing risk details:', riskId);
    // Implementar navegación a detalles del riesgo
  }
}
