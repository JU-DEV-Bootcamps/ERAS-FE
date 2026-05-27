import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { BaseApiService } from '@core/services/api/base-api.service';
import { InterventionModel } from '@core/models/assessement.model';

export interface AddInterventionPayload {
  assessmentId: number;
  intervention: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class InterventionService extends BaseApiService {
  protected resource = 'assessments';

  getByAssessment(assessmentId: number): Observable<InterventionModel[]> {
    return this.get<InterventionModel[]>(`${assessmentId}/interventions`);
  }

  createIntervention(
    payload: AddInterventionPayload
  ): Observable<InterventionModel> {
    return this.post<AddInterventionPayload, InterventionModel>(
      'interventions',
      payload
    );
  }

  upsertInterventions(
    assessmentId: number,
    interventions: InterventionModel[]
  ): Observable<InterventionModel[]> {
    return this.put<InterventionModel[], InterventionModel[]>(
      `${assessmentId}/interventions`,
      interventions
    );
  }

  deleteIntervention(
    assessmentId: number,
    interventionId: number
  ): Observable<void> {
    return this.delete<void>(`${assessmentId}/interventions/${interventionId}`);
  }

  uploadAttachments(
    interventionId: number,
    files: File[]
  ): Observable<string[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.postForm<string[]>(
      `interventions/${interventionId}/attachments`,
      formData
    );
  }

  getAttachmentUrl(interventionId: number, fileName: string): string {
    return `${environment.apiUrl}/api/v1/assessments/interventions/${interventionId}/attachments/${fileName}`;
  }
}
