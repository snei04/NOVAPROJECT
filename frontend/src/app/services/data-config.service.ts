import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataConfigService {
  private apiAvailable = signal(false);
  private apiChecked = signal(false);

  constructor(private http: HttpClient) {
    this.checkApiAvailability();
  }

  // Verificar si la API está disponible
  private async checkApiAvailability() {
    try {
      await this.http.get(`${environment.API_URL}/api/health`).toPromise();
      this.apiAvailable.set(true);
      console.log('✅ API Backend disponible - usando datos reales');
    } catch (error) {
      this.apiAvailable.set(false);
      console.log('⚠️ API Backend no disponible - usando datos mock');
    } finally {
      this.apiChecked.set(true);
    }
  }

  // Getters públicos
  get isApiAvailable() {
    return this.apiAvailable();
  }

  get isApiChecked() {
    return this.apiChecked();
  }

  // Método para hacer requests con fallback automático
  requestWithFallback<T>(
    apiCall: () => Observable<T>, 
    mockData: T
  ): Observable<T> {
    if (!this.isApiAvailable) {
      return of(mockData);
    }

    return apiCall().pipe(
      catchError((error) => {
        console.warn('API call failed, using mock data:', error);
        return of(mockData);
      })
    );
  }

  // Método para datos síncronos con fallback
  dataWithFallback<T>(realData: T | null, mockData: T): T {
    return this.isApiAvailable && realData ? realData : mockData;
  }
}
