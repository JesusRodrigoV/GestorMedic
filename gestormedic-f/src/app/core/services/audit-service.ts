import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuditQueryParams, PaginatedAuditLogs } from '@core/models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/audit/`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  getLogs(params: AuditQueryParams = {}): Observable<PaginatedAuditLogs> {
    let httpParams = new HttpParams();
    
    if (params.clinic_id) {
      httpParams = httpParams.set('clinic_id', params.clinic_id.toString());
    }
    if (params.event_type) {
      httpParams = httpParams.set('event_type', params.event_type);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<PaginatedAuditLogs>(`${this.apiUrl}/`, {
      ...this.httpOptions,
      params: httpParams
    });
  }
}