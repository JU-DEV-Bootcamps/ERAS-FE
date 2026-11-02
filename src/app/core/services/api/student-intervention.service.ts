import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/services/api/base-api.service';
import {
  SaveStudentInterventionModel,
  StudentInterventionModel,
} from '@core/models/student-intervention.model';

@Injectable({
  providedIn: 'root',
})
export class StudentInterventionService extends BaseApiService {
  protected resource = 'students';

  getByStudent(studentId: number): Observable<StudentInterventionModel[]> {
    return this.get<StudentInterventionModel[]>(`${studentId}/interventions`);
  }

  create(
    studentId: number,
    entry: SaveStudentInterventionModel
  ): Observable<StudentInterventionModel> {
    return this.post<SaveStudentInterventionModel, StudentInterventionModel>(
      `${studentId}/interventions`,
      entry
    );
  }

  update(
    studentId: number,
    entryId: number,
    entry: SaveStudentInterventionModel
  ): Observable<StudentInterventionModel> {
    return this.put<SaveStudentInterventionModel, StudentInterventionModel>(
      `${studentId}/interventions/${entryId}`,
      entry
    );
  }

  remove(studentId: number, entryId: number): Observable<void> {
    return this.delete<void>(`${studentId}/interventions/${entryId}`);
  }
}
