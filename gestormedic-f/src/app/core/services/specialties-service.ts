import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedSpecialties, Specialty, SpecialtyPayload, SpecialtyQueryParams } from '@core/models/specialty.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialtiesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/specialties`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  list(params: SpecialtyQueryParams = {}): Observable<PaginatedSpecialties> {
    let httpParams = new HttpParams();
    
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<PaginatedSpecialties>(this.apiUrl, {
      ...this.httpOptions,
      params: httpParams
    });
  }

  create(payload: SpecialtyPayload): Observable<Specialty> {
    return this.http.post<Specialty>(`${this.apiUrl}/`, payload, this.httpOptions);
  }

  getById(id: number): Observable<Specialty> {
    return this.http.get<Specialty>(`${this.apiUrl}/${id}/`, this.httpOptions);
  }

  update(id: number, payload: SpecialtyPayload): Observable<Specialty> {
    return this.http.put<Specialty>(`${this.apiUrl}/${id}/`, payload, this.httpOptions);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`, this.httpOptions);
  }
}