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
      catchError(() => throwError(() => new Error('Error on health check')))
    );
  }

  getPollNames(configurationId: number) {
    const params = new HttpParams().set('ConfigurationId', configurationId);
    return this.get<PollName[]>('polls/names', params).pipe(
      map(polls => sortArray(polls, 'name')),
      catchError(error =>
        throwError(() => new Error('Failed to fetch polls details', error))
      )
    );
  }

  // --- V1 (síncrono) ---
  importAnswerBySurvey(
    configurationId: number,
    evaluationSetName: string,
    start?: string | null,
    end?: string | null
  ) {
    let params = new HttpParams()
      .set('EvaluationSetName', evaluationSetName)
      .set('ConfigurationId', configurationId.toString());
    if (start && start.length > 0) params = params.set('startDate', start);
    if (end && end.length > 0) params = params.set('endDate', end);
    return this.get<PollInstance[]>('polls', params);
  }

  savePollsCosmicLattePreview(data: PollInstance[], evaluationId: number) {
    return this.post<PollInstance[]>(`polls/${evaluationId}`, data);
  }

  // --- V2 (async, job-based) ---
  startExtraction(request: StartExtractionRequest) {
    return this.post<StartExtractionRequest, QueuedImportResponse>(
      'imports/extract',
      request
    );
  }

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
