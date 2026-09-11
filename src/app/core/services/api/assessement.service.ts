import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { BaseApiService } from '@core/services/api/base-api.service';
import { AssessmentModel } from '../../models/assessment.model';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService extends BaseApiService {
  protected resource = 'assessments';

  private assessmentsCache$: Observable<AssessmentModel[]> | null = null;

  clearCache(): void {
    this.assessmentsCache$ = null;
  }

  getAll(): Observable<AssessmentModel[]> {
    if (this.assessmentsCache$) {
      return this.assessmentsCache$;
    }

    this.assessmentsCache$ = this.get<AssessmentModel[]>('').pipe(
      shareReplay(1)
    );
    return this.assessmentsCache$;
  }

  // TODO: Implement this after API Endpoints had been implemented
  getByCreator(creator: string): Observable<AssessmentModel[]> {
    console.log(`Getting assessments for ${creator}`);
    return this.get<AssessmentModel[]>('');
  }

  // TODO: Implement this after API Endpoints had been implemented
  getByProfessional(professional: string): Observable<AssessmentModel[]> {
    console.log(`Getting assessments for ${professional}`);
    return this.get<AssessmentModel[]>('');
  }

  getById(id: string): Observable<AssessmentModel> {
    return this.get<AssessmentModel>(id);
  }

  createAssessment(
    newAssessment: AssessmentModel
  ): Observable<AssessmentModel> {
    return this.post<AssessmentModel>('', newAssessment);
  }

  editAssessment(
    id: string,
    editedAssessment: AssessmentModel
  ): Observable<AssessmentModel> {
    return this.put<AssessmentModel>(id, editedAssessment);
  }

  deleteAssessment(id: number) {
    return this.delete<AssessmentModel>(id);
  }
}
