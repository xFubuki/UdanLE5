import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';

type ApiErrorResponse = {
  message?: string;
};

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  form = {
    username: '',
    password: '',
  };

  isSubmitting = false;
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.form.username.trim() || !this.form.password) {
      this.errorMessage = 'User name and password are required.';
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.form.username.trim(), this.form.password).subscribe({
      next: (response) => {
        if (!response.token || !response.user?.id) {
          this.errorMessage = 'The login response was not in the expected format.';
          this.isSubmitting = false;
          return;
        }

        this.tokenStorage.saveToken(response.token);
        this.tokenStorage.saveUser(response.user.id);
        const redirectUrl = this.authService.redirectUrl || '/';
        this.authService.redirectUrl = '/';
        void this.router.navigateByUrl(redirectUrl);
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

    if (error.status === 401) {
      return 'Invalid user name or password.';
    }

    return 'Login failed. Please try again.';
  }
}
