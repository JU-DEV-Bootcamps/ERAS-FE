import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { BaseApiService } from '@core/services/api/base-api.service';
import { AssessmentModel } from '../../models/assessement.model';

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

  getById(id: string): Observable<AssessmentModel> {
    return this.get<AssessmentModel>(id);
  }

  createAssessment(
    newAssessment: AssessmentModel
  ): Observable<AssessmentModel> {
    return this.post<AssessmentModel>('', newAssessment);
  }
}
