import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Editor } from '@tiptap/core';
import { DatabaseService } from '../../../../services/database.service';
import { DatabaseData } from '../../../../models/database.model';

@Component({
  selector: 'app-menu-bar',
  standalone: false,
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent {
  @Input() editor!: Editor;
  @Output() insertDatabase = new EventEmitter<DatabaseData>();

  constructor(private databaseService: DatabaseService) {}

  // Formato de texto
  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  // Encabezados
  setHeading(level: 1 | 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  setParagraph(): void {
    this.editor?.chain().focus().setParagraph().run();
  }

  // Listas
  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleTaskList(): void {
    this.editor?.chain().focus().toggleTaskList().run();
  }

  // Tablas
  insertTable(): void {
    this.editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  addColumnBefore(): void {
    this.editor?.chain().focus().addColumnBefore().run();
  }

  addColumnAfter(): void {
    this.editor?.chain().focus().addColumnAfter().run();
  }

  deleteColumn(): void {
    this.editor?.chain().focus().deleteColumn().run();
  }

  addRowBefore(): void {
    this.editor?.chain().focus().addRowBefore().run();
  }

  addRowAfter(): void {
    this.editor?.chain().focus().addRowAfter().run();
  }

  deleteRow(): void {
    this.editor?.chain().focus().deleteRow().run();
  }

  deleteTable(): void {
    this.editor?.chain().focus().deleteTable().run();
  }

  // Base de datos
  onInsertDatabase(): void {
    const newDatabase = this.databaseService.createEmptyDatabase();
    this.insertDatabase.emit(newDatabase);
  }

  // Verificar estados activos
  isActive(name: string, attrs?: any): boolean {
    return this.editor?.isActive(name, attrs) || false;
  }
}
