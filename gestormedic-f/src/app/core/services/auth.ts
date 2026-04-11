import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse, User } from '@core/models/auth.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  register(data: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  googleLogin(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, data);
  }

  verify2FA(sessionToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/2fa/verify-login`, {
      session_token: sessionToken,
      code,
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {});
  }

  logout(): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/logout`, {});
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update-profile`, data);
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/reset-password`, data);
  }
}
