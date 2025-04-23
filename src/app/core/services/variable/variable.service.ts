import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Variable } from './interface/variable.interface';

@Injectable({
  providedIn: 'root',
})
export class VariableService {
  private apiUrl = `${environment.apiUrl}/api/v1/Variables`;
  constructor(private http: HttpClient) {}

  getVariablesByPollUuid(pollUuid: string, components: string[]) {
    let params = new HttpParams().set('pollUuid', pollUuid);
    components.forEach(component => {
      params = params.append('component', component);
    });

    return this.http.get<Variable[]>(`${this.apiUrl}`, { params });
  }
}
