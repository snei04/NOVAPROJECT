import { Injectable } from '@angular/core';
import { DatabaseData, Column, Row, ColumnType, CellValue, DatabaseFilter, DatabaseSort } from '../models/database.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  /**
   * Crear una base de datos vacía con columnas por defecto
   */
  createEmptyDatabase(): DatabaseData {
    const id = this.generateId();
    return {
      id,
      columns: [
        { id: 'col-1', name: 'Nombre', type: 'text' },
        {
          id: 'col-2',
          name: 'Estado',
          type: 'select',
          options: ['Pendiente', 'En progreso', 'Completado']
        },
        { id: 'col-3', name: 'Fecha', type: 'date' }
      ],
      rows: [{ id: 'row-1', data: {} }]
    };
  }

  /**
   * Añadir una nueva fila a la base de datos
   */
  addRow(database: DatabaseData): DatabaseData {
    const newRow: Row = {
      id: `row-${Date.now()}`,
      data: {}
    };
    return {
      ...database,
      rows: [...database.rows, newRow]
    };
  }

  /**
   * Eliminar una fila de la base de datos
   */
  deleteRow(database: DatabaseData, rowId: string): DatabaseData {
    return {
      ...database,
      rows: database.rows.filter(row => row.id !== rowId)
    };
  }

  /**
   * Añadir una nueva columna a la base de datos
   */
  addColumn(database: DatabaseData, columnType: ColumnType = 'text'): DatabaseData {
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: 'Nueva Columna',
      type: columnType,
      options: columnType === 'select' || columnType === 'multiselect' ? ['Opción 1'] : undefined
    };
    return {
      ...database,
      columns: [...database.columns, newColumn]
    };
  }

  /**
   * Eliminar una columna de la base de datos
   */
  deleteColumn(database: DatabaseData, columnId: string): DatabaseData {
    const updatedRows = database.rows.map(row => {
      const newData = { ...row.data };
      delete newData[columnId];
      return { ...row, data: newData };
    });

    return {
      ...database,
      columns: database.columns.filter(col => col.id !== columnId),
      rows: updatedRows
    };
  }

  /**
   * Actualizar el valor de una celda
   */
  updateCell(database: DatabaseData, rowId: string, columnId: string, value: any): DatabaseData {
    const updatedRows = database.rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          data: { ...row.data, [columnId]: value }
        };
      }
      return row;
    });

    return { ...database, rows: updatedRows };
  }

  /**
   * Actualizar una columna (nombre, tipo, opciones)
   */
  updateColumn(database: DatabaseData, columnId: string, updates: Partial<Column>): DatabaseData {
    const updatedColumns = database.columns.map(col => {
      if (col.id === columnId) {
        return { ...col, ...updates };
      }
      return col;
    });

    return { ...database, columns: updatedColumns };
  }

  /**
   * Ordenar filas por una columna
   */
  sortRows(database: DatabaseData, sort: DatabaseSort): DatabaseData {
    const column = database.columns.find(col => col.id === sort.columnId);
    if (!column) return database;

    const sortedRows = [...database.rows].sort((a, b) => {
      const aValue = a.data[sort.columnId];
      const bValue = b.data[sort.columnId];

      // Manejo de valores nulos
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      // Ordenamiento según el tipo de columna
      let comparison = 0;
      switch (column.type) {
        case 'number':
          comparison = Number(aValue) - Number(bValue);
          break;
        case 'date':
          comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
          break;
        case 'checkbox':
          comparison = (aValue ? 1 : 0) - (bValue ? 1 : 0);
          break;
        default:
          comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return { ...database, rows: sortedRows };
  }

  /**
   * Filtrar filas según criterios
   */
  filterRows(database: DatabaseData, filters: DatabaseFilter[]): DatabaseData {
    if (filters.length === 0) return database;

    const filteredRows = database.rows.filter(row => {
      return filters.every(filter => {
        const value = row.data[filter.columnId];
        
        switch (filter.operator) {
          case 'isEmpty':
            return value === undefined || value === null || value === '';
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    return { ...database, rows: filteredRows };
  }

  /**
   * Exportar base de datos a formato de array para Excel
   */
  exportToArray(database: DatabaseData): any[][] {
    // Primera fila: nombres de columnas
    const headers = database.columns.map(col => col.name);
    
    // Filas de datos
    const dataRows = database.rows.map(row => {
      return database.columns.map(col => {
        const value = row.data[col.id];
        
        // Formatear según el tipo de columna
        if (value === undefined || value === null) return '';
        
        switch (col.type) {
          case 'checkbox':
            return value ? '✓' : '';
          case 'date':
            return value ? new Date(value).toLocaleDateString() : '';
          case 'multiselect':
            return Array.isArray(value) ? value.join(', ') : value;
          default:
            return value;
        }
      });
    });

    return [headers, ...dataRows];
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `db-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
