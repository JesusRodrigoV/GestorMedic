import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthResponse,
  User,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  TwoFAInfo,
  UserSession,
} from '@core/models/auth.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  register(data: RegisterData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, this.httpOptions);
  }

  setup2FA(): Observable<TwoFAInfo> {
    return this.http.post<TwoFAInfo>(`${this.apiUrl}/2fa/setup`, {}, this.httpOptions);
  }

  confirm2FA(code: string, secret: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/2fa/confirm`, { code, secret }, this.httpOptions);
  }

  verify2FA(sessionToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/2fa/verify`,
      {
        session_token: sessionToken,
        code,
      },
      this.httpOptions,
    );
  }

  getSessions(): Observable<UserSession[]> {
    return this.http.get<UserSession[]>(`${this.apiUrl}/sessions`, this.httpOptions);
  }

  revokeSession(jti: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/sessions/${jti}`, this.httpOptions);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, this.httpOptions);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, this.httpOptions);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, this.httpOptions);
  }

  resetPassword(data: ResetPasswordData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, data);
  }

}
