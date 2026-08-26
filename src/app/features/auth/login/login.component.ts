import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthStore } from '../../../core/auth/admin-auth.store';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AppIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly router = inject(Router);
  readonly auth = inject(AdminAuthStore);
  readonly form = new FormGroup({
    email: new FormControl('admin@saviaup.local', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('Savia123*', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.auth.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const success = await this.auth.login(
      this.form.controls.email.value,
      this.form.controls.password.value,
    );
    if (success) await this.router.navigate(['/dashboard']);
  }
}
