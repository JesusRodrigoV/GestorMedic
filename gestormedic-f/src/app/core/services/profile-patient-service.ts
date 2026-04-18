import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PatientProfile, UpdatePatientProfilePayload } from '@core/models/patient-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilePatientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profiles/patients`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  getMyProfile(): Observable<PatientProfile> {
    return this.http.get<PatientProfile>(`${this.apiUrl}/me`, this.httpOptions);
  }

  updateMyProfile(payload: UpdatePatientProfilePayload): Observable<PatientProfile> {
    return this.http.put<PatientProfile>(`${this.apiUrl}/me`, payload, this.httpOptions);
  }

  getProfileByUserId(userId: number): Observable<PatientProfile> {
    return this.http.get<PatientProfile>(`${this.apiUrl}/${userId}`, this.httpOptions);
  }

  updateProfileByUserId(userId: number, payload: UpdatePatientProfilePayload): Observable<PatientProfile> {
    return this.http.put<PatientProfile>(`${this.apiUrl}/${userId}`, payload, this.httpOptions);
  }
}