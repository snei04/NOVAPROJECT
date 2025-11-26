import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DocumentService } from '../../../../services/document.service';
import { Document } from '../../../../models/document.model';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  isLoading = false;
  isCollapsed = false;
  private destroy$ = new Subject<void>();

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    
    // Suscribirse a cambios en documentos
    this.documentService.documents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(documents => {
        this.documents = documents;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getDocuments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando documentos:', error);
          this.isLoading = false;
        }
      });
  }

  createNewDocument(): void {
    this.documentService.createDocument({ title: 'Sin título' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newDoc) => {
          this.router.navigate(['/app/documents', newDoc.id]);
        },
        error: (error) => {
          console.error('Error creando documento:', error);
        }
      });
  }

  navigateToDocument(documentId: string): void {
    this.router.navigate(['/app/documents', documentId]);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getDocumentIcon(doc: Document): string {
    return doc.icon || '📄';
  }
}
