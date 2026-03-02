import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

// Sesión expira tras 20 minutos de inactividad TOTAL
const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutos en milisegundos
// Renovar token proactivamente cada 10 minutos mientras hay actividad
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutos

@Injectable({
  providedIn: 'root'
})
export class InactivityService implements OnDestroy {

  private inactivityTimer: any;
  private tokenRefreshTimer: any;
  private lastActivityTime: number = Date.now();
  private isActive = false;
  private eventsBound = false;

  public userInactive: Subject<any> = new Subject();

  // Todos los eventos que indican actividad del usuario
  private readonly ACTIVITY_EVENTS = [
    'mousemove',
    'mousedown',
    'click',
    'keypress',
    'keydown',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend',
    'drag',
    'dragstart',
    'dragend',
    'wheel',
    'pointerdown',
    'pointermove'
  ];

  private boundResetHandler: () => void;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    this.boundResetHandler = this.onUserActivity.bind(this);
  }

  /**
   * Inicia el servicio de detección de inactividad.
   * Se llama desde el LayoutComponent cuando el usuario está autenticado.
   */
  startWatching() {
    if (this.eventsBound) return;

    this.isActive = true;
    this.lastActivityTime = Date.now();
    this.initActivityListeners();
    this.startInactivityTimer();
    this.startTokenRefreshCycle();
    this.eventsBound = true;
  }

  /**
   * Detiene toda la detección de actividad.
   */
  stopWatching() {
    this.isActive = false;
    this.eventsBound = false;
    this.clearTimers();
    this.removeActivityListeners();
  }

  ngOnDestroy() {
    this.stopWatching();
  }

  /**
   * Registra listeners para TODOS los eventos de interacción del usuario.
   * Se ejecuta fuera de Angular Zone para no impactar en rendimiento.
   */
  private initActivityListeners() {
    this.ngZone.runOutsideAngular(() => {
      this.ACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, this.boundResetHandler, { passive: true });
      });
    });
  }

  /**
   * Remueve todos los listeners registrados.
   */
  private removeActivityListeners() {
    this.ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, this.boundResetHandler);
    });
  }

  /**
   * Callback de actividad: resetea el timer de inactividad.
   * Cada vez que el usuario interactúa, el reloj de expiración se reinicia.
   */
  private onUserActivity() {
    this.lastActivityTime = Date.now();
    this.resetInactivityTimer();
  }

  /**
   * Inicia el timer de inactividad.
   * Si el usuario no hace nada por INACTIVITY_TIMEOUT, se cierra la sesión.
   */
  private startInactivityTimer() {
    this.ngZone.runOutsideAngular(() => {
      this.inactivityTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.handleInactivityTimeout();
        });
      }, INACTIVITY_TIMEOUT);
    });
  }

  /**
   * Resetea el timer de inactividad (se llama con cada actividad del usuario).
   */
  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.isActive) {
      this.startInactivityTimer();
    }
  }

  /**
   * Inicia el ciclo de renovación de token.
   * Mientras el usuario esté activo, renueva el accessToken periódicamente
   * para que NUNCA expire mientras trabaja.
   */
  private startTokenRefreshCycle() {
    this.ngZone.runOutsideAngular(() => {
      this.tokenRefreshTimer = setInterval(() => {
        const timeSinceLastActivity = Date.now() - this.lastActivityTime;

        // Solo renovar si hubo actividad reciente (en los últimos INACTIVITY_TIMEOUT ms)
        if (timeSinceLastActivity < INACTIVITY_TIMEOUT) {
          this.ngZone.run(() => {
            this.refreshTokenProactively();
          });
        }
      }, TOKEN_REFRESH_INTERVAL);
    });
  }

  /**
   * Renueva el token de acceso proactivamente.
   * Esto asegura que mientras el usuario trabaje activamente,
   * el token de acceso NUNCA expire.
   */
  private refreshTokenProactively() {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken && this.tokenService.isValidRefreshToken()) {
      this.authService.refreshToken(refreshToken).subscribe({
        next: () => {
          // Token renovado exitosamente - sesión activa
          console.log('[Sesión] Token renovado proactivamente');
        },
        error: () => {
          // Si falla la renovación, cerramos sesión
          console.warn('[Sesión] Error renovando token, cerrando sesión');
          this.logout();
        }
      });
    }
  }

  /**
   * Se ejecuta cuando el timer de inactividad expira.
   */
  private handleInactivityTimeout() {
    // Verificar que realmente pasó el tiempo de inactividad
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      this.userInactive.next(true);
      this.logout();
    } else {
      // Si hubo actividad reciente, reiniciar el timer
      this.resetInactivityTimer();
    }
  }

  /**
   * Cierra la sesión del usuario y limpia todos los recursos.
   */
  private logout() {
    this.stopWatching();
    this.tokenService.removeToken();
    this.tokenService.removeRefreshToken();
    this.router.navigate(['/login']);
  }

  /**
   * Limpia todos los timers activos.
   */
  private clearTimers() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }
}
