import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface LoginResponse {
  token: string;
  expiresInMinutes: number;
  user: {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
  };
}

export interface RegisterResponse {
  message: string;
}

export type RegisterRequest = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  redirectUrl = '/';

  get isLoggedIn(): boolean {
    return this.tokenStorage.getToken() !== null;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/Login/login`, {
      username,
      password,
    });
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.apiBaseUrl}/Login/register`, request)
      .pipe(tap(() => undefined));
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.redirectUrl = '/';
  }
}
