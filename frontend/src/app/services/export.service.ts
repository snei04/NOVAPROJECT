import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Document, DocumentContent } from '../models/document.model';
import { DatabaseData } from '../models/database.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private databaseService: DatabaseService) {}

  /**
   * Exportar documento completo a Excel
   */
  exportDocumentToExcel(document: Document): void {
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Información del documento
    const docInfo = [
      ['Título', document.title],
      ['Fecha de creación', new Date(document.createdAt).toLocaleString()],
      ['Última actualización', new Date(document.updatedAt).toLocaleString()],
      ['ID', document.id]
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(docInfo);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Información');

    // Hoja 2: Contenido de texto
    const textContent = this.extractTextContent(document.content);
    if (textContent.length > 0) {
      const textSheet = XLSX.utils.aoa_to_sheet([['Contenido'], ...textContent.map(t => [t])]);
      XLSX.utils.book_append_sheet(workbook, textSheet, 'Texto');
    }

    // Hojas adicionales: Bases de datos
    if (document.content.databases && document.content.databases.length > 0) {
      document.content.databases.forEach((db, index) => {
        const dbData = this.databaseService.exportToArray(db);
        const dbSheet = XLSX.utils.aoa_to_sheet(dbData);
        const sheetName = `Base de Datos ${index + 1}`;
        XLSX.utils.book_append_sheet(workbook, dbSheet, sheetName);
      });
    }

    // Exportar tablas del contenido
    const tables = this.extractTables(document.content);
    tables.forEach((table, index) => {
      const tableSheet = XLSX.utils.aoa_to_sheet(table);
      const sheetName = `Tabla ${index + 1}`;
      XLSX.utils.book_append_sheet(workbook, tableSheet, sheetName);
    });

    // Generar archivo
    const fileName = `${document.title || 'documento'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Exportar solo una base de datos a Excel
   */
  exportDatabaseToExcel(database: DatabaseData, fileName?: string): void {
    const workbook = XLSX.utils.book_new();
    const dbData = this.databaseService.exportToArray(database);
    const sheet = XLSX.utils.aoa_to_sheet(dbData);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Datos');

    const file = fileName || `base_de_datos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, file);
  }

  /**
   * Exportar datos a CSV
   */
  exportToCSV(data: any[][], fileName: string): void {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Datos');
    XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
  }

  /**
   * Extraer contenido de texto del documento
   */
  private extractTextContent(content: DocumentContent): string[] {
    const textLines: string[] = [];

    const extractFromNode = (node: any): void => {
      if (node.type === 'text' && node.text) {
        textLines.push(node.text);
      }
      
      if (node.type === 'heading' && node.content) {
        const headingText = node.content.map((n: any) => n.text || '').join('');
        textLines.push(`${'#'.repeat(node.attrs?.level || 1)} ${headingText}`);
      }

      if (node.type === 'paragraph' && node.content) {
        const paragraphText = node.content.map((n: any) => n.text || '').join('');
        if (paragraphText.trim()) {
          textLines.push(paragraphText);
        }
      }

      if (node.type === 'taskItem') {
        const checked = node.attrs?.checked ? '[x]' : '[ ]';
        const taskText = node.content?.map((n: any) => n.text || '').join('') || '';
        textLines.push(`${checked} ${taskText}`);
      }

      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: any) => extractFromNode(child));
      }
    };

    if (content.content && Array.isArray(content.content)) {
      content.content.forEach(node => extractFromNode(node));
    }

    return textLines;
  }

  /**
   * Extraer tablas del contenido del documento
   */
  private extractTables(content: DocumentContent): any[][][] {
    const tables: any[][][] = [];

    const extractFromNode = (node: any): void => {
      if (node.type === 'table' && node.content) {
        const tableData: any[][] = [];
        
        node.content.forEach((row: any) => {
          if (row.type === 'tableRow' && row.content) {
            const rowData: any[] = [];
            row.content.forEach((cell: any) => {
              if ((cell.type === 'tableCell' || cell.type === 'tableHeader') && cell.content) {
                // Usar una función recursiva para extraer texto de la celda (puede contener párrafos)
                const cellText = this.getTextFromNode(cell);
                rowData.push(cellText);
              }
            });
            tableData.push(rowData);
          }
        });

        if (tableData.length > 0) {
          tables.push(tableData);
        }
      }

      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: any) => extractFromNode(child));
      }
    };

    if (content.content && Array.isArray(content.content)) {
      content.content.forEach(node => extractFromNode(node));
    }

    return tables;
  }

  /**
   * Helper para extraer todo el texto dentro de un nodo recursivamente
   */
  private getTextFromNode(node: any): string {
    if (node.text) {
      return node.text;
    }

    if (node.content && Array.isArray(node.content)) {
      return node.content.map((child: any) => this.getTextFromNode(child)).join(' ');
    }

    return '';
  }

  /**
   * Importar datos desde Excel
   */
  importFromExcel(file: File): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          resolve(jsonData as any[][]);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }
}
