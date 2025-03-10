import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComponentAvg } from '../../shared/models/components/component-avg.model';

@Injectable({
  providedIn: 'root',
})
export class ComponentsService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/Components';

  constructor(private http: HttpClient) {}

  getComponentsRiskByPollForStudent(
    studentId: number,
    pollId: number
  ): Observable<ComponentAvg[]> {
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('pollId', pollId);
    const url = `${this.apiUrl}/${this.endpoint}/getComponentsRiskAvgByStudent`;
    return this.http.get<ComponentAvg[]>(url, { params });
  }
}
