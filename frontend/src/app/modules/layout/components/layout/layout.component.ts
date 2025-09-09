import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- NUEVO
import { AuthService } from '@services/auth.service';
import { InactivityService } from '@services/inactivity.service';
import { NavbarComponent } from '../navbar/navbar.component'; // <-- NUEVO

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  standalone: true, // <-- AÑADIDO
  imports: [RouterModule, NavbarComponent], // <-- AÑADIDO
})
export class LayoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    this.authService.getProfile()
    .subscribe(() => {
      console.log('get profile');
    });
  }
}
