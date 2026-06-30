import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { HealthCheckResponse } from '../../models/cosmic-latte-request.model';
import { PollName } from '../../models/poll-request.model';
import { PollInstance } from '../../models/poll-instance.model';
import {
  ImportJobItem,
  ImportJobStatusModel,
  QueuedImportResponse,
  StartExtractionRequest,
} from '../../models/import-job.model';
import { sortArray } from '../../utils/helpers/sort';

@Injectable({
  providedIn: 'root',
})
export class CosmicLatteService extends BaseApiService {
  protected resource = 'cosmic-latte';

  healthCheck(configurationId: number) {
    const params = new HttpParams().set('ConfigurationId', configurationId);

    return this.get<HealthCheckResponse>('health', params).pipe(
      catchError(() => {
        return throwError(() => new Error('Error on health check'));
      })
    );
  }

  importAnswerBySurvey(
    configurationId: number,
    evaluationSetName: string,
    start?: string | null,
    end?: string | null
  ) {
    let params = new HttpParams()
      .set('EvaluationSetName', evaluationSetName)
      .set('ConfigurationId', configurationId.toString());
    if (start && start.length > 0) {
      params = params.set('startDate', start);
    }
    if (end && end.length > 0) {
      params = params.set('endDate', end);
    }
    return this.get<PollInstance[]>('polls', params);
  }

  getPollNames(configurationId: number) {
    const params = new HttpParams().set('ConfigurationId', configurationId);
    return this.get<PollName[]>('polls/names', params).pipe(
      map(polls => sortArray(polls, 'name')),
      catchError(error => {
        return throwError(
          () => new Error('Failed to fetch polls details', error)
        );
      })
    );
  }

  /**
   * Starts the background extraction of respondents from Cosmic Latte. Returns 202 with the import
   * job id; the client polls the unified import view and confirms the selection afterwards.
   */
  startExtraction(request: StartExtractionRequest) {
    return this.post<StartExtractionRequest, QueuedImportResponse>(
      'imports/extract',
      request
    );
  }

  /** Confirms which extracted respondents to persist (no answer payload is re-sent). */
  confirmImport(importJobId: number, itemIds: number[]) {
    return this.post<{ itemIds: number[] }, QueuedImportResponse>(
      `imports/${importJobId}/confirm`,
      { itemIds }
    );
  }

  getImportStatus(importJobId: number) {
    return this.get<ImportJobStatusModel>(`imports/${importJobId}`);
  }

  getImportItems(importJobId: number) {
    return this.get<ImportJobItem[]>(`imports/${importJobId}/items`);
  }

  retryImportItems(importJobId: number, itemIds: number[]) {
    return this.post<{ itemIds: number[] }, QueuedImportResponse>(
      `imports/${importJobId}/retry`,
      { itemIds }
    );
  }
}
