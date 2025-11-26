import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // 1. Obtenemos el token de ACCESO, no el de refresco.
    const token = this.tokenService.getToken();

    // 2. Verificamos si EXISTE.
    if (!token) {
      // Si no hay token, es un usuario no autenticado.
      this.router.navigate(['/login']);
      return false;
    }

    // Si existe un token, permitimos el paso.
    return true;
  }
}
