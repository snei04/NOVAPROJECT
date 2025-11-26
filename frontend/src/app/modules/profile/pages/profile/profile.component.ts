import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- NUEVO
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'; // <-- NUEVO
import { MeService } from '@services/me.service';
import { AuthService } from '@services/auth.service';
import { User } from '@models/user.model';
import { ToastrService } from 'ngx-toastr';
// import { ButtonComponent } from '../shared/components/button/button.component'; // <-- NUEVO
// TODO: Update the import path below to the correct location of ButtonComponent
// Example:
import { ButtonComponent } from '../../../shared/components/button/button.component'; // <-- UPDATED PATH
// import { SafeUrlPipe } from '../../pipes/safe-url.pipe'; // <-- NUEVO

// TODO: Update the path below to the correct location of SafeUrlPipe
// Example: If the pipe is in 'src/app/shared/pipes/safe-url.pipe.ts', use the following import:
import { SafeUrlPipe } from '../../../../pipes/safe-url.pipe'; // <-- UPDATED PATH

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true, // <-- AÑADIDO
  imports: [ // <-- AÑADIDO
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    SafeUrlPipe
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: [{ value: '', disabled: true }],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private meService: MeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.form.patchValue({
          name: user.name,
          email: user.email,
        });
      }
    });
  }

  updateProfile() {
    if (this.form.valid) {
      const { name } = this.form.getRawValue();
      this.meService.updateProfile(name).subscribe(() => {
        this.toastr.success('Perfil actualizado');
        this.authService.getProfile().subscribe();
      });
    }
  }
}
