import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timestamp } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HealthCheckResponse } from '../../shared/models/cosmic-latte/health-check.model';

@Injectable({
  providedIn: 'root',
})
export class CostmicLatteService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {

  }

  healthCheck(): Observable<HealthCheckResponse> {
    return this.http.options<HealthCheckResponse>(`${this.apiUrl}/cosmic-latte/status`).pipe(
      catchError(() => {
        return throwError(() => new Error('Error on health check'));
      })
    );
  }
}