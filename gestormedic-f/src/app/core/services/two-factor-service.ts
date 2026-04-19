import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse } from '@core/models/auth.model';
import {
  TwoFAConfirmPayload,
  TwoFASetupResponse,
  TwoFAVerifyPayload,
} from '@core/models/two-factor.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TwoFactor {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  setup(): Observable<TwoFASetupResponse> {
    return this.http.post<TwoFASetupResponse>(`${this.apiUrl}/2fa/setup`, {}, this.httpOptions);
  }

  confirm(payload: TwoFAConfirmPayload): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/2fa/confirm`, payload, this.httpOptions);
  }

  verify(payload: TwoFAVerifyPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/2fa/verify`, payload, this.httpOptions);
  }
}
