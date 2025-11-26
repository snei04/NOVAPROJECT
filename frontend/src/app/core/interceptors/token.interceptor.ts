import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { TokenService } from '@services/token.service';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);
  
  const token = tokenService.getToken();

  let request = req;
  if (token) {
    request = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = tokenService.getRefreshToken();
        if (refreshToken) {
           return authService.refreshToken(refreshToken).pipe(
             switchMap((res) => {
               const newReq = req.clone({
                 headers: req.headers.set('Authorization', `Bearer ${res.access_token}`)
               });
               return next(newReq);
             }),
             catchError((refreshErr) => {
               authService.logout();
               router.navigate(['/login']);
               return throwError(() => refreshErr);
             })
           );
        } else {
           authService.logout();
           router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};