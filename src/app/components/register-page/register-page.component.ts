import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

type ApiErrorResponse = {
  message?: string;
};

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.form.username.trim() ||
      !this.form.password ||
      !this.form.firstName.trim() ||
      !this.form.lastName.trim()
    ) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.isSubmitting = true;

    this.authService
      .register({
        username: this.form.username.trim(),
        password: this.form.password,
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Registration successful. Redirecting to login...';
          this.isSubmitting = false;
          setTimeout(() => {
            void this.router.navigateByUrl('/login');
          }, 800);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.isSubmitting = false;
        },
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiErrorResponse | null;

    if (apiError?.message) {
      return apiError.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the backend. Confirm the API is running and CORS allows http://localhost:4200.';
    }

    if (error.status === 409) {
      return 'That user name already exists.';
    }

    return 'Registration failed. Please try again.';
  }
}
