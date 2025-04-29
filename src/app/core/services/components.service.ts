import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComponentsAvgModel } from '../models/components-avg.model';

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
  ): Observable<ComponentsAvgModel[]> {
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('pollId', pollId);
    const url = `${this.apiUrl}/${this.endpoint}/RiskAvg`;
    return this.http.get<ComponentsAvgModel[]>(url, { params });
  }
}
