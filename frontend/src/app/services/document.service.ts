import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Document, CreateDocumentDto, UpdateDocumentDto } from '../models/document.model';
import { environment } from '../../environments/environment';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.API_URL}/api/documents`;
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  private currentDocumentSubject = new BehaviorSubject<Document | null>(null);
  public currentDocument$ = this.currentDocumentSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los documentos no archivados
   */
  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl, { context: checkToken() }).pipe(
      tap(documents => this.documentsSubject.next(documents))
    );
  }

  /**
   * Obtener un documento específico por ID
   */
  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`, { context: checkToken() }).pipe(
      tap(document => this.currentDocumentSubject.next(document))
    );
  }

  /**
   * Crear un nuevo documento
   */
  createDocument(data: CreateDocumentDto): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, data, { context: checkToken() }).pipe(
      tap(newDocument => {
        const currentDocs = this.documentsSubject.value;
        this.documentsSubject.next([...currentDocs, newDocument]);
      })
    );
  }

  /**
   * Actualizar un documento existente
   */
  updateDocument(id: string, data: UpdateDocumentDto): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, data, { context: checkToken() }).pipe(
      tap(updatedDocument => {
        const currentDocs = this.documentsSubject.value;
        const index = currentDocs.findIndex(doc => doc.id === id);
        if (index !== -1) {
          currentDocs[index] = updatedDocument;
          this.documentsSubject.next([...currentDocs]);
        }
        if (this.currentDocumentSubject.value?.id === id) {
          this.currentDocumentSubject.next(updatedDocument);
        }
      })
    );
  }

  /**
   * Archivar un documento (soft delete)
   */
  archiveDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { context: checkToken() }).pipe(
      tap(() => {
        const currentDocs = this.documentsSubject.value.filter(doc => doc.id !== id);
        this.documentsSubject.next(currentDocs);
        if (this.currentDocumentSubject.value?.id === id) {
          this.currentDocumentSubject.next(null);
        }
      })
    );
  }

  /**
   * Obtener documentos hijos de un documento padre
   */
  getChildDocuments(parentId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/children/${parentId}`, { context: checkToken() });
  }

  /**
   * Invitar colaborador
   */
  inviteCollaborator(id: string, email: string, role: string = 'editor'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/invite`, { email, role }, { context: checkToken() });
  }

  /**
   * Actualizar el documento actual en el subject
   */
  setCurrentDocument(document: Document | null): void {
    this.currentDocumentSubject.next(document);
  }

  /**
   * Limpiar el documento actual
   */
  clearCurrentDocument(): void {
    this.currentDocumentSubject.next(null);
  }
}
