import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HealthCheckResponse } from '../../shared/models/cosmic-latte/health-check.model';
import { PollInstance } from '../../core/services/Types/cosmicLattePollImportList';
import { PollName } from '../../shared/models/cosmic-latte/PollName';

@Injectable({
  providedIn: 'root',
})
export class CosmicLatteService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  healthCheck(): Observable<HealthCheckResponse> {
    return this.http
      .get<HealthCheckResponse>(`${this.apiUrl}/api/v1/health`)
      .pipe(
        catchError(() => {
          return throwError(() => new Error('Error on health check'));
        })
      );
  }

  importAnswerBySurvey(
    name: string,
    start?: string | null,
    end?: string | null
  ): Observable<PollInstance[]> {
    let params = new HttpParams().set('name', name);
    if (start && start.length > 0) {
      params = params.set('startDate', start);
    }
    if (end && end.length > 0) {
      params = params.set('endDate', end);
    }
    return this.http
      .get<
        PollInstance[]
      >(`${this.apiUrl}/api/v1/CosmicLatte/polls?`, { params })
      .pipe(
        catchError(error => {
          return throwError(() => new Error(`${error.message}`));
        })
      );
  }

  getPollNames(): Observable<PollName[]> {
    return this.http
      .get<PollName[]>(`${this.apiUrl}/api/v1/CosmicLatte/polls/names`)
      .pipe(
        catchError(error => {
          return throwError(
            () => new Error('Failed to fetch polls details', error)
          );
        })
      );
  }
}
