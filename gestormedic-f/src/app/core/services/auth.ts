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
  GoogleLoginData,
  ForgotPasswordData,
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

  loginGoogle(data: GoogleLoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/google`, data, this.httpOptions);
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

  forgotPassword(data: ForgotPasswordData): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordData): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/reset-password`, data);
  }
}
