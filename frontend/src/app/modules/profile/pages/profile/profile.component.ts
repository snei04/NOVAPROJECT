import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MeService } from '@services/me.service';
import { AuthService } from '@services/auth.service';
import { User } from '@models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
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
        // Opcional: Refrescar el perfil del usuario en toda la app
        this.authService.getProfile().subscribe();
      });
    }
  }
}
