import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { Subject } from 'rxjs';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos en milisegundos

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  
  private timer: any;
  public userInactive: Subject<any> = new Subject();

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private ngZone: NgZone
  ) {
    this.initListener();
    this.initTimer();
  }

  initListener() {
    this.ngZone.runOutsideAngular(() => {
      ['mousemove', 'click', 'keypress', 'scroll'].forEach(event => {
        window.addEventListener(event, () => this.resetTimer());
      });
    });
  }

  initTimer() {
    this.ngZone.runOutsideAngular(() => {
      this.timer = setTimeout(() => {
        this.ngZone.run(() => {
          this.logout();
        });
      }, INACTIVITY_TIMEOUT);
    });
  }

  resetTimer() {
    clearTimeout(this.timer);
    this.initTimer();
  }

  logout() {
    this.tokenService.removeToken();
    this.tokenService.removeRefreshToken();
    this.router.navigate(['/login']);
  }
}
