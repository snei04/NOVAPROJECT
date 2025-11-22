import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { DocumentService } from '../../../../services/document.service';
import { ExportService } from '../../../../services/export.service';
import { Document, DocumentContent } from '../../../../models/document.model';

@Component({
  selector: 'app-document-detail',
  standalone: false,
  templateUrl: './document-detail.component.html',
  styleUrl: './document-detail.component.scss'
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  document: Document | null = null;
  isLoading = true;
  isSaving = false;
  saveStatus: 'saved' | 'saving' | 'error' = 'saved';
  
  private destroy$ = new Subject<void>();
  private saveSubject$ = new Subject<{ id: string; content: DocumentContent }>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private documentService: DocumentService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        if (id) {
          this.loadDocument(id);
        }
      });

    // Configurar autoguardado con debounce
    this.saveSubject$
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(({ id, content }) => {
        this.saveDocument(id, content);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocument(id: string): void {
    this.isLoading = true;
    this.documentService.getDocument(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doc) => {
          this.document = doc;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando documento:', error);
          this.isLoading = false;
          this.router.navigate(['/app/documents']);
        }
      });
  }

  onContentChange(content: DocumentContent): void {
    if (this.document) {
      this.saveStatus = 'saving';
      this.saveSubject$.next({ id: this.document.id, content });
    }
  }

  onTitleChange(title: string): void {
    if (this.document) {
      this.document.title = title;
      this.saveStatus = 'saving';
      this.documentService.updateDocument(this.document.id, { title })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.saveStatus = 'saved';
          },
          error: () => {
            this.saveStatus = 'error';
          }
        });
    }
  }

  private saveDocument(id: string, content: DocumentContent): void {
    this.isSaving = true;
    this.documentService.updateDocument(id, { content })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.saveStatus = 'saved';
        },
        error: (error) => {
          console.error('Error guardando documento:', error);
          this.isSaving = false;
          this.saveStatus = 'error';
        }
      });
  }

  exportDocument(): void {
    if (this.document) {
      this.exportService.exportDocumentToExcel(this.document);
    }
  }

  archiveDocument(): void {
    if (this.document && confirm('¿Estás seguro de archivar este documento?')) {
      this.documentService.archiveDocument(this.document.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/app/documents']);
          },
          error: (error) => {
            console.error('Error archivando documento:', error);
          }
        });
    }
  }
}
