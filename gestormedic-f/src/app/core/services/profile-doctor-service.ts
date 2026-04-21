import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DoctorProfile, UpdateDoctorProfilePayload } from '@core/models/doctor-profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileDoctorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profiles/doctors`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  createOnboarding(payload: UpdateDoctorProfilePayload): Observable<DoctorProfile> {
    return this.http.post<DoctorProfile>(`${this.apiUrl}/onboarding/`, payload, this.httpOptions);
  }

  getMyProfile(): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(`${this.apiUrl}/me/`, this.httpOptions);
  }

  updateMyProfile(payload: UpdateDoctorProfilePayload): Observable<DoctorProfile> {
    return this.http.put<DoctorProfile>(`${this.apiUrl}/me/`, payload, this.httpOptions);
  }

  addSpecialtyToMyProfile(specialtyId: number): Observable<DoctorProfile> {
    return this.http.post<DoctorProfile>(
      `${this.apiUrl}/me/specialties/${specialtyId}/`,
      {},
      this.httpOptions,
    );
  }

  removeSpecialtyFromMyProfile(specialtyId: number): Observable<DoctorProfile> {
    return this.http.delete<DoctorProfile>(
      `${this.apiUrl}/me/specialties/${specialtyId}/`,
      this.httpOptions,
    );
  }

  getProfileByUserId(userId: number): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(`${this.apiUrl}/${userId}/`, this.httpOptions);
  }

  updateProfileByUserId(
    userId: number,
    payload: UpdateDoctorProfilePayload,
  ): Observable<DoctorProfile> {
    return this.http.put<DoctorProfile>(`${this.apiUrl}/${userId}/`, payload, this.httpOptions);
  }
}
