import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { HealthCheckResponse } from '../../models/cosmic-latte-request.model';
import { PollName } from '../../models/poll-request.model';
import { PollInstance } from '../../models/poll-instance.model';

@Injectable({
  providedIn: 'root',
})
export class CosmicLatteService extends BaseApiService {
  protected resource = 'cosmic-latte';

  healthCheck() {
    return this.http.get<HealthCheckResponse>(`${this.apiUrl}/health`).pipe(
      catchError(() => {
        return throwError(() => new Error('Error on health check'));
      })
    );
  }

  importAnswerBySurvey(
    evaluationSetName: string,
    start?: string | null,
    end?: string | null
  ) {
    let params = new HttpParams().set('EvaluationSetName', evaluationSetName);
    if (start && start.length > 0) {
      params = params.set('startDate', start);
    }
    if (end && end.length > 0) {
      params = params.set('endDate', end);
    }
    return this.get<PollInstance[]>('polls', params);
  }

  getPollNames() {
    return this.get<PollName[]>('polls/names').pipe(
      catchError(error => {
        return throwError(
          () => new Error('Failed to fetch polls details', error)
        );
      })
    );
  }

  savePollsCosmicLattePreview(data: PollInstance[]) {
    return this.post<PollInstance[]>('polls', data);
  }
}
