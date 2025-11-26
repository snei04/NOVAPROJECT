// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="flex flex-col min-h-screen">
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <footer class="fixed bottom-0 left-0 right-0 bg-zinc-800 text-gray-300 px-4 py-2 flex justify-between items-center text-sm z-50">
        <div class="footer-left">
          <p>Todos los derechos reservados 2025 | Desarrollado por IMEVISAS desde el equipo de TI</p> 
        </div>
        <div class="footer-right">
          <p>Version: v{{ appVersion }}</p>
        </div>
      </footer>
    </div>
  `,
  // Optional: Add some styles if needed, e.g., for specific text colors
   styles: [`
     .footer-left p { color: #white; }
     .footer-right p { color: #white; }
   `]
})
export class AppComponent {
  public appVersion: string = environment.version;
}