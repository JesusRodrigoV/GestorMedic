import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AppearanceSettingsPayload,
  AuthResponse,
  NotificationSettingsPayload,
  UpdateProfilePayload,
  User,
} from '@core/models/auth.model';
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
    // FastAPI OAuth2 espera x-www-form-urlencoded
    const body = new HttpParams()
      .set('username', credentials.email || credentials.username)
      .set('password', credentials.password);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
    });
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {});
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(data: UpdateProfilePayload): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update-profile`, data);
  }

  updateNotifications(data: NotificationSettingsPayload): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update-notifications`, data);
  }

  updateAppearance(data: AppearanceSettingsPayload): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update-appearance`, data);
  }
}
