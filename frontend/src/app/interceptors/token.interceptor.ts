import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpContextToken, HttpContext } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { TokenService } from '@services/token.service';
import { AuthService } from '@services/auth.service';

const CHECK_TOKEN = new HttpContextToken<boolean>(() => false);

export function checkToken() {
  return new HttpContext().set(CHECK_TOKEN, true);
}

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.context.get(CHECK_TOKEN)) {
      return next.handle(request);
    }

    const accessToken = this.tokenService.getToken();
    if (accessToken) {
      request = this.addToken(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 (Token Expirado)
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      const refreshToken = this.tokenService.getRefreshToken();

      if (refreshToken && this.tokenService.isValidRefreshToken()) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            this.tokenService.saveToken(response.access_token);
            // Reintentamos la petición original con el nuevo token
            return next.handle(this.addToken(request, response.access_token));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            // Si el refresh token también falla, cerramos sesión
            this.tokenService.removeToken();
            this.tokenService.removeRefreshToken();
            this.router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
    }
    // Si no hay refresh token o ya se está refrescando, cerramos sesión
    this.tokenService.removeToken();
    this.tokenService.removeRefreshToken();
    this.router.navigate(['/login']);
    return throwError(() => new Error('Refresh token not available'));
  }
}