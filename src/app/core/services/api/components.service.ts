import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ComponentsAvgModel } from '../../models/components-avg.model';
import { BaseApiService } from './base-api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ComponentsService extends BaseApiService {
  protected resource = 'api/Components';

  getComponentsRiskByPollForStudent(
    studentId: number,
    pollId: number
  ): Observable<ComponentsAvgModel[]> {
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('pollId', pollId);
    return this.get<ComponentsAvgModel[]>('RiskAvg', params);
  }
}
