import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { ButtonComponent } from './components/button/button.component';
import { CardColorComponent } from './components/card-color/card-color.component';

@NgModule({
  declarations: [ButtonComponent, CardColorComponent,  SafeUrlPipe ],
  imports: [CommonModule, FontAwesomeModule],
  exports: [ButtonComponent, CardColorComponent, SafeUrlPipe ],
})
export class SharedModule {}
