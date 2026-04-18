import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Clinic,
  ClinicPayload,
  ClinicQueryParams,
  PaginatedClinics,
} from '@core/models/clinic.model';

@Injectable({
  providedIn: 'root',
})
export class ClinicsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clinics`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  list(params: ClinicQueryParams = {}): Observable<PaginatedClinics> {
    let httpParams = new HttpParams();

    if (params.is_active !== undefined && params.is_active !== null) {
      httpParams = httpParams.set('is_active', params.is_active.toString());
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<PaginatedClinics>(`${this.apiUrl}/`, {
      ...this.httpOptions,
      params: httpParams,
    });
  }

  create(payload: ClinicPayload): Observable<Clinic> {
    return this.http.post<Clinic>(`${this.apiUrl}/`, payload, this.httpOptions);
  }

  createOnboarding(payload: ClinicPayload): Observable<Clinic> {
    return this.http.post<Clinic>(`${this.apiUrl}/onboarding`, payload, this.httpOptions);
  }

  getById(id: number): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  update(id: number, payload: ClinicPayload): Observable<Clinic> {
    return this.http.put<Clinic>(`${this.apiUrl}/${id}`, payload, this.httpOptions);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions);
  }
}
