export interface DatabaseData {
  id: string;
  columns: Column[];
  rows: Row[];
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[];
}

export interface Row {
  id: string;
  data: Record<string, any>;
}

export type ColumnType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'checkbox'
  | 'multiselect';

export interface CellValue {
  columnId: string;
  rowId: string;
  value: any;
}

export interface DatabaseFilter {
  columnId: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty';
  value: any;
}

export interface DatabaseSort {
  columnId: string;
  direction: 'asc' | 'desc';
}
