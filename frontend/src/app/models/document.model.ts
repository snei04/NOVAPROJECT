export interface Document {
  id: string;
  title: string;
  content: DocumentContent;
  icon: string | null;
  parentId: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentContent {
  type: 'doc';
  content: ContentNode[];
  databases?: DatabaseData[];
}

export interface ContentNode {
  type: string;
  attrs?: Record<string, any>;
  content?: ContentNode[];
  text?: string;
  marks?: Mark[];
}

export interface Mark {
  type: string;
  attrs?: Record<string, any>;
}

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

export interface CreateDocumentDto {
  title?: string;
  parentId?: string;
  icon?: string;
}

export interface UpdateDocumentDto {
  title?: string;
  content?: DocumentContent;
  icon?: string;
  isArchived?: boolean;
}
