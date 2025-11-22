import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { DocumentContent } from '../../../../models/document.model';
import { DatabaseData } from '../../../../models/database.model';

@Component({
  selector: 'app-editor',
  standalone: false,
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialContent?: DocumentContent;
  @Input() documentId?: string;
  @Output() contentChange = new EventEmitter<DocumentContent>();
  @Output() databaseInsert = new EventEmitter<DatabaseData>();
  
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  
  editor: Editor | null = null;
  databases: DatabaseData[] = [];
  private destroy$ = new Subject<void>();
  private contentUpdate$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupAutoSave();
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private initializeEditor(): void {
    if (!this.editorContainer) return;

    this.editor = new Editor({
      element: this.editorContainer.nativeElement,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3]
          }
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ],
      // FIX: Pasar el objeto completo (con type: 'doc') o un objeto válido por defecto
      content: this.initialContent || { type: 'doc', content: [] },
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none p-4'
        }
      },
      onUpdate: () => {
        this.contentUpdate$.next();
      }
    });

    // Cargar bases de datos si existen
    if (this.initialContent?.databases) {
      this.databases = this.initialContent.databases;
    }
  }

  private setupAutoSave(): void {
    this.contentUpdate$
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitContent();
      });
  }

  private emitContent(): void {
    if (!this.editor) return;

    const content: DocumentContent = {
      type: 'doc',
      content: this.editor.getJSON().content || [],
      databases: this.databases
    };

    this.contentChange.emit(content);
  }

  insertDatabase(database: DatabaseData): void {
    this.databases.push(database);
    this.databaseInsert.emit(database);
    this.emitContent();
  }

  updateDatabase(index: number, database: DatabaseData): void {
    if (index >= 0 && index < this.databases.length) {
      this.databases[index] = database;
      this.emitContent();
    }
  }

  deleteDatabase(index: number): void {
    if (index >= 0 && index < this.databases.length) {
      this.databases.splice(index, 1);
      this.emitContent();
    }
  }

  getEditor(): Editor | null {
    return this.editor;
  }
}
