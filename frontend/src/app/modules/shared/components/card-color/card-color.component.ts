import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- IMPORTADO
import { Colors, COLORS } from '@models/colors.model';

@Component({
  selector: 'app-card-color',
  templateUrl: './card-color.component.html',
  standalone: true, // <-- AÑADIDO
  imports: [CommonModule], // <-- AÑADIDO
})
export class CardColorComponent {
  @Input() color: Colors = 'sky';

  mapColors = COLORS;

  constructor() {}

  get colors() {
    const classes = this.mapColors[this.color];
    return classes ? classes : {};
  }
}
