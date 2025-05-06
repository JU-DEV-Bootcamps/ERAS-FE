import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Variable } from '../interfaces/variable.interface';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class VariableService extends BaseApiService {
  protected resource = '/api/v1/Variables';

  getVariablesByPollUuid(pollUuid: string, components: string[]) {
    let params = new HttpParams().set('pollUuid', pollUuid);
    components.forEach(component => {
      params = params.append('component', component);
    });
    return this.get<Variable[]>('', params);
  }
}
