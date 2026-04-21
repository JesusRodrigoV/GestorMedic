import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { InsuranceProfile, UpdateInsuranceProfilePayload } from '@core/models/insurance-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileInsuranceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profiles/insurances`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  getMyProfile(): Observable<InsuranceProfile> {
    return this.http.get<InsuranceProfile>(`${this.apiUrl}/me/`, this.httpOptions);
  }

  updateMyProfile(payload: UpdateInsuranceProfilePayload): Observable<InsuranceProfile> {
    return this.http.put<InsuranceProfile>(`${this.apiUrl}/me/`, payload, this.httpOptions);
  }

  getProfileByUserId(userId: number): Observable<InsuranceProfile> {
    return this.http.get<InsuranceProfile>(`${this.apiUrl}/${userId}/`, this.httpOptions);
  }

  updateProfileByUserId(userId: number, payload: UpdateInsuranceProfilePayload): Observable<InsuranceProfile> {
    return this.http.put<InsuranceProfile>(`${this.apiUrl}/${userId}/`, payload, this.httpOptions);
  }
}