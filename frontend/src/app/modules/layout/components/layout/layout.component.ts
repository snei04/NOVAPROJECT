import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { InactivityService } from '@services/inactivity.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  standalone: true,
  imports: [RouterModule, NavbarComponent],
})
export class LayoutComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private inactivityService: InactivityService
  ) { }

  ngOnInit() {
    this.authService.getProfile()
      .subscribe(() => {
        console.log('get profile');
      });

    // Iniciar detección de actividad para mantener la sesión activa
    this.inactivityService.startWatching();
  }

  ngOnDestroy() {
    // Detener detección de actividad al salir del layout
    this.inactivityService.stopWatching();
  }
}
