import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UpdatePatientProfileData } from '@core/models/profile.model';
import { environment } from '@env/environment';
import PatientProfile from '@features/patient-portal/profile/profile';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profiles`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  getPatientProfile(): Observable<PatientProfile> {
    return this.http.get<PatientProfile>(`${this.apiUrl}/patients/me`, this.httpOptions);
  }

  updatePatientProfile(data: UpdatePatientProfileData): Observable<PatientProfile> {
    return this.http.put<PatientProfile>(`${this.apiUrl}/patients/me`, data, this.httpOptions);
  }
}
