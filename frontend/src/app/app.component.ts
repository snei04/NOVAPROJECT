// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- Importa RouterModule
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true, // <-- AÑADIDO
  imports: [RouterModule], // <-- AÑADIDO para que <router-outlet> funcione
  template: `
    <router-outlet></router-outlet>
    
    <footer style="text-align: center; padding: 20px; color: grey; margin-top: 40px;">
      <p>NovaProject v{{ appVersion }}</p>
    </footer>
  `,
})
export class AppComponent {
  public appVersion: string = environment.version; 
}