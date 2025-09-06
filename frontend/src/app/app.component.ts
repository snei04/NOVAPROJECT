// src/app/app.component.ts
import { Component } from '@angular/core';
import { environment } from '../environments/environment'; // 1. Importa environment

@Component({
  selector: 'app-root',
  // 2. Modifica el template para añadir el footer con la versión
  template: `
    <router-outlet></router-outlet>
    
    <footer style="text-align: center; padding: 20px; color: grey; margin-top: 40px;">
      <p>NovaProject v{{ appVersion }}</p>
    </footer>
  `,
})
export class AppComponent {
  // 3. Añade la variable y asígnale el valor de la versión
  public appVersion: string = environment.version; 
}