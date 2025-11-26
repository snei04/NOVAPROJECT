import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; 
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Colors, COLORS } from '@models/colors.model';

@Component({
  selector: 'app-btn',
  templateUrl: './button.component.html',
  standalone: true, // <-- AÑADIDO
  imports: [CommonModule, FontAwesomeModule], // <-- AÑADIDO
})
export class ButtonComponent {
  @Input() disabled = false;
  @Input() loading = false;
  @Input() typeBtn: 'reset' | 'submit' | 'button' = 'button';
  @Input() color: Colors = 'primary';
  faSpinner = faSpinner;

  mapColors = COLORS;

  constructor() {}

  get colors() {
    const colors = this.mapColors[this.color];
    if (colors) {
      return colors;
    }
    return {};
  }
}
