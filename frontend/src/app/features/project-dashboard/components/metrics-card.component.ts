import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MetricsCardData {
  title: string;
  value: number;
  unit?: string;
  total?: number;
  target?: number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  comparison?: {
    label: string;
    value: string;
  };
  severity?: 'low' | 'medium' | 'high' | 'critical';
  highlight?: boolean;
}

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-card" 
         [class.highlighted]="highlight"
         [class.critical]="severity === 'critical'"
         [class.high]="severity === 'high'"
         [class.medium]="severity === 'medium'">
      
      <!-- Header -->
      <div class="card-header">
        <div class="icon-container">
          <span class="icon">{{ icon }}</span>
        </div>
        <div class="title-section">
          <h3 class="card-title">{{ title }}</h3>
          @if (trend) {
            <div class="trend-indicator" [class]="'trend-' + trend">
              <span class="trend-icon">{{ getTrendIcon() }}</span>
              <span class="trend-text">{{ getTrendText() }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Main Value -->
      <div class="value-section">
        <div class="main-value">
          <span class="value">{{ displayValue() }}</span>
          @if (unit && !total) {
            <span class="unit">{{ unit }}</span>
          }
          @if (total) {
            <span class="total">/{{ total }}</span>
          }
        </div>
        
        @if (progressPercentage() !== null) {
          <div class="progress-bar">
            <div class="progress-fill" 
                 [style.width.%]="progressPercentage()"
                 [class]="getProgressClass()">
            </div>
          </div>
          <div class="progress-text">
            {{ progressPercentage() }}% completado
          </div>
        }
      </div>

      <!-- Comparison -->
      @if (comparison) {
        <div class="comparison-section">
          <div class="comparison-label">{{ comparison.label }}</div>
          <div class="comparison-value" [class]="getComparisonClass()">
            {{ comparison.value }}
          </div>
        </div>
      }

      <!-- Target Indicator -->
      @if (target && !total) {
        <div class="target-section">
          <div class="target-label">Meta: {{ target }}{{ unit || '' }}</div>
          <div class="target-progress">
            <div class="target-bar">
              <div class="target-fill" [style.width.%]="targetPercentage()"></div>
            </div>
            <span class="target-text">{{ targetPercentage() }}%</span>
          </div>
        </div>
      }

      <!-- Additional Info -->
      @if (severity && (severity === 'high' || severity === 'critical')) {
        <div class="alert-section">
          <div class="alert-message">
            @if (severity === 'critical') {
              <span class="alert-icon">🚨</span>
              <span>Atención inmediata requerida</span>
            } @else {
              <span class="alert-icon">⚠️</span>
              <span>Requiere seguimiento</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .metrics-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .metrics-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .metrics-card.highlighted {
      border: 2px solid #3b82f6;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
    }

    .metrics-card.critical {
      border-left: 4px solid #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, white 100%);
    }

    .metrics-card.high {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, white 100%);
    }

    .metrics-card.medium {
      border-left: 4px solid #eab308;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #f3f4f6;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .icon {
      font-size: 1.5rem;
    }

    .title-section {
      flex: 1;
      margin-left: 1rem;
    }

    .card-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin: 0;
      line-height: 1.2;
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      margin-top: 0.25rem;
      font-size: 0.75rem;
    }

    .trend-up {
      color: #10b981;
    }

    .trend-down {
      color: #ef4444;
    }

    .trend-stable {
      color: #6b7280;
    }

    .trend-icon {
      margin-right: 0.25rem;
    }

    .value-section {
      margin-bottom: 1rem;
    }

    .main-value {
      display: flex;
      align-items: baseline;
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      line-height: 1;
    }

    .unit {
      font-size: 1rem;
      color: #6b7280;
      margin-left: 0.25rem;
    }

    .total {
      font-size: 1.25rem;
      color: #6b7280;
      margin-left: 0.25rem;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.6s ease;
      border-radius: 3px;
    }

    .progress-fill.success {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .progress-fill.warning {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .progress-fill.danger {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .progress-fill.info {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .progress-text {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: right;
    }

    .comparison-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .comparison-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .comparison-value {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .comparison-value.positive {
      color: #10b981;
    }

    .comparison-value.negative {
      color: #ef4444;
    }

    .comparison-value.neutral {
      color: #6b7280;
    }

    .target-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .target-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .target-progress {
      display: flex;
      align-items: center;
    }

    .target-bar {
      flex: 1;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      margin-right: 0.5rem;
    }

    .target-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    .target-text {
      font-size: 0.75rem;
      color: #6b7280;
      min-width: 3rem;
      text-align: right;
    }

    .alert-section {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
    }

    .alert-message {
      display: flex;
      align-items: center;
      font-size: 0.75rem;
      color: #991b1b;
    }

    .alert-icon {
      margin-right: 0.5rem;
    }

    /* Animaciones */
    .metrics-card {
      animation: slideInUp 0.6s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .progress-fill {
      animation: fillProgress 1s ease-out 0.5s both;
    }

    @keyframes fillProgress {
      from {
        width: 0;
      }
    }
  `]
})
export class MetricsCardComponent {
  @Input({required: true}) title!: string;
  @Input({required: true}) value!: number;
  @Input() unit?: string;
  @Input() total?: number;
  @Input() target?: number;
  @Input({required: true}) icon!: string;
  @Input() trend?: 'up' | 'down' | 'stable';
  @Input() comparison?: { label: string; value: string };
  @Input() severity?: 'low' | 'medium' | 'high' | 'critical';
  @Input() highlight?: boolean;

  displayValue = computed(() => {
    if (this.value >= 1000000) {
      return (this.value / 1000000).toFixed(1) + 'M';
    }
    if (this.value >= 1000) {
      return (this.value / 1000).toFixed(1) + 'K';
    }
    return this.value.toString();
  });

  progressPercentage = computed(() => {
    if (this.total) {
      return Math.round((this.value / this.total) * 100);
    }
    if (this.target) {
      return Math.min(Math.round((this.value / this.target) * 100), 100);
    }
    return null;
  });

  targetPercentage = computed(() => {
    if (this.target) {
      return Math.min(Math.round((this.value / this.target) * 100), 100);
    }
    return 0;
  });

  getTrendIcon(): string {
    switch (this.trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  }

  getTrendText(): string {
    switch (this.trend) {
      case 'up': return 'Mejorando';
      case 'down': return 'Empeorando';
      case 'stable': return 'Estable';
      default: return '';
    }
  }

  getProgressClass(): string {
    const percentage = this.progressPercentage();
    if (percentage === null) return 'info';
    
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'danger';
  }

  getComparisonClass(): string {
    if (!this.comparison) return 'neutral';
    
    const value = this.comparison.value;
    if (value.includes('+') || value.includes('↗')) return 'positive';
    if (value.includes('-') || value.includes('↘')) return 'negative';
    return 'neutral';
  }
}
