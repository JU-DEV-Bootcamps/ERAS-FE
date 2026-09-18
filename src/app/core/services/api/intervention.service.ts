import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/services/api/base-api.service';
import {
  InterventionModel,
  UpdateInterventionModel,
  UpdateInterventionPayload,
} from '@core/models/assessment.model';

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

  // TODO: Implement this after API Endpoints had been implemented
  getByAssessmentAndCreator(
    assessmentId: number,
    creator: string
  ): Observable<InterventionModel[]> {
    console.log(`Getting interventions for ${creator}`);
    return this.get<InterventionModel[]>(`${assessmentId}/interventions`);
  }

  getByAssessmentAndAssignedProfessional(
    assessmentId: number,
    professional: string
  ): Observable<InterventionModel[]> {
    console.log(`Getting interventions for ${professional}`);
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

  updateInterventionOld(
    assessmentId: number,
    interventionId: number,
    intervention: InterventionModel
  ): Observable<InterventionModel> {
    return this.put<InterventionModel, InterventionModel>(
      `${assessmentId}/interventions/${interventionId}`,
      intervention
    );
  }

  updateIntervention(
    assessmentId: number,
    interventionId: number,
    payload: UpdateInterventionModel
  ): Observable<UpdateInterventionPayload> {
    return this.put<UpdateInterventionModel, UpdateInterventionPayload>(
      `${assessmentId}/interventions/${interventionId}`,
      payload
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

  downloadAttachment(
    interventionId: number,
    fileName: string
  ): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/assessments/interventions/${interventionId}/attachments/${fileName}`,
      { responseType: 'blob' }
    );
  }

  deleteAttachment(interventionId: number, fileName: string): Observable<void> {
    return this.delete<void>(
      `interventions/${interventionId}/attachments/${fileName}`
    );
  }
}
