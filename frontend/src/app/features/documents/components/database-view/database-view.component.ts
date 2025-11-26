import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatabaseData, Column, Row, ColumnType } from '../../../../models/database.model';
import { DatabaseService } from '../../../../services/database.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-database-view',
  standalone: false,
  templateUrl: './database-view.component.html',
  styleUrl: './database-view.component.scss'
})
export class DatabaseViewComponent {
  @Input() database!: DatabaseData;
  @Input() databaseIndex!: number;
  @Output() databaseChange = new EventEmitter<DatabaseData>();
  @Output() databaseDelete = new EventEmitter<void>();

  columnTypes: ColumnType[] = ['text', 'number', 'select', 'date', 'checkbox', 'multiselect'];
  editingCell: { rowId: string; columnId: string } | null = null;
  configuringColumnId: string | null = null; // ID de la columna cuyas opciones se están editando

  constructor(
    private databaseService: DatabaseService,
    private exportService: ExportService
  ) {}

  // ... métodos existentes ...

  toggleConfiguringColumn(columnId: string): void {
    if (this.configuringColumnId === columnId) {
      this.configuringColumnId = null;
    } else {
      this.configuringColumnId = columnId;
    }
  }

  addOption(column: Column, optionValue: string): void {
    if (!optionValue.trim()) return;
    
    const currentOptions = column.options || [];
    if (currentOptions.includes(optionValue)) return;

    const updatedOptions = [...currentOptions, optionValue];
    const updated = this.databaseService.updateColumn(this.database, column.id, { options: updatedOptions });
    this.databaseChange.emit(updated);
  }

  removeOption(column: Column, optionValue: string): void {
    const currentOptions = column.options || [];
    const updatedOptions = currentOptions.filter(opt => opt !== optionValue);
    const updated = this.databaseService.updateColumn(this.database, column.id, { options: updatedOptions });
    this.databaseChange.emit(updated);
  }

  addRow(): void {
    const updated = this.databaseService.addRow(this.database);
    this.databaseChange.emit(updated);
  }

  deleteRow(rowId: string): void {
    const updated = this.databaseService.deleteRow(this.database, rowId);
    this.databaseChange.emit(updated);
  }

  addColumn(): void {
    const updated = this.databaseService.addColumn(this.database);
    this.databaseChange.emit(updated);
  }

  deleteColumn(columnId: string): void {
    const updated = this.databaseService.deleteColumn(this.database, columnId);
    this.databaseChange.emit(updated);
  }

  updateCell(rowId: string, columnId: string, value: any): void {
    const updated = this.databaseService.updateCell(this.database, rowId, columnId, value);
    this.databaseChange.emit(updated);
    this.editingCell = null;
  }

  updateColumnName(columnId: string, name: string): void {
    const updated = this.databaseService.updateColumn(this.database, columnId, { name });
    this.databaseChange.emit(updated);
  }

  updateColumnType(columnId: string, type: ColumnType): void {
    const updated = this.databaseService.updateColumn(this.database, columnId, { type });
    this.databaseChange.emit(updated);
  }

  getCellValue(row: Row, column: Column): any {
    return row.data[column.id];
  }

  startEditing(rowId: string, columnId: string): void {
    this.editingCell = { rowId, columnId };
  }

  isEditing(rowId: string, columnId: string): boolean {
    return this.editingCell?.rowId === rowId && this.editingCell?.columnId === columnId;
  }

  exportToExcel(): void {
    this.exportService.exportDatabaseToExcel(this.database, `base_datos_${this.databaseIndex + 1}`);
  }

  onDelete(): void {
    if (confirm('¿Estás seguro de eliminar esta base de datos?')) {
      this.databaseDelete.emit();
    }
  }
}
