import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HealthCheckResponse } from '../../shared/models/cosmic-latte/health-check.model';

@Injectable({
  providedIn: 'root',
})
export class CostmicLatteService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  healthCheck(): Observable<HealthCheckResponse> {
    return this.http
      .options<HealthCheckResponse>(`${this.apiUrl}/cosmic-latte/status`)
      .pipe(
        catchError(() => {
          return throwError(() => new Error('Error on health check'));
        })
      );
  }

  importAnswerBySurvey(name: string, start?: string, end?: string) {
    let params = new HttpParams().set('name', name);
    if (start && start.length > 0) {
      params = params.set('startDate', start);
    }
    if (end && end.length > 0) {
      params = params.set('endDate', end);
    }

    return this.http.get(`${this.apiUrl}/api/Evaluations?`, { params }).pipe(
      catchError(error => {
        return throwError(
          () => new Error('Failed to fetch answers by survey', error)
        );
      })
    );
  }
}
