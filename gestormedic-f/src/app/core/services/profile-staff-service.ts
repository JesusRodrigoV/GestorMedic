import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { StaffProfile, UpdateStaffProfilePayload } from '@core/models/staff-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileStaffService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profiles/staff`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  getMyProfile(): Observable<StaffProfile> {
    return this.http.get<StaffProfile>(`${this.apiUrl}/me/`, this.httpOptions);
  }

  updateMyProfile(payload: UpdateStaffProfilePayload): Observable<StaffProfile> {
    return this.http.put<StaffProfile>(`${this.apiUrl}/me/`, payload, this.httpOptions);
  }

  getProfileByUserId(userId: number): Observable<StaffProfile> {
    return this.http.get<StaffProfile>(`${this.apiUrl}/${userId}/`, this.httpOptions);
  }

  updateProfileByUserId(userId: number, payload: UpdateStaffProfilePayload): Observable<StaffProfile> {
    return this.http.put<StaffProfile>(`${this.apiUrl}/${userId}/`, payload, this.httpOptions);
  }
}