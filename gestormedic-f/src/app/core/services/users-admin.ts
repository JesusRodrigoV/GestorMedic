import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@core/models/auth.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  private readonly httpOptions = {
    withCredentials: true,
  };

  listUsers(params: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortType: 'asc' | 'desc';
    filter?: string;
  }): Observable<{
    items: User[];
    metadata: {
      total: number;
      page: number;
      pageSize: number;
      skip: number;
      limit: number;
      total_pages: number;
    };
  }> {
    return this.http.get<{
      items: User[];
      metadata: {
        total: number;
        page: number;
        pageSize: number;
        skip: number;
        limit: number;
        total_pages: number;
      };
    }>(this.apiUrl, { params: params as Record<string, string | number>, ...this.httpOptions });
  }
}
