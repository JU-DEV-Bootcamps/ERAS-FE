import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { HealthCheckResponse } from '../../models/cosmic-latte-request.model';
import { PollInstance } from '../interfaces/cosmic-latte-poll-import-list.interface';
import { PollName } from '../../models/poll-request.model';

@Injectable({
  providedIn: 'root',
})
export class CosmicLatteService extends BaseApiService {
  protected resource = 'api/v1/CosmicLatte';

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
    evaluationSetName: string,
    start?: string | null,
    end?: string | null
  ): Observable<PollInstance[]> {
    let params = new HttpParams().set('EvaluationSetName', evaluationSetName);
    if (start && start.length > 0) {
      params = params.set('startDate', start);
    }
    if (end && end.length > 0) {
      params = params.set('endDate', end);
    }
    return this.get<PollInstance[]>('polls', params);
  }

  getPollNames(): Observable<PollName[]> {
    return this.get<PollName[]>('polls/names').pipe(
      catchError(error => {
        return throwError(
          () => new Error('Failed to fetch polls details', error)
        );
      })
    );
  }
}
