import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ComponentValueType,
  RiskStudentDetailType,
} from '../../features/heat-map/types/risk-students-detail.type';
import { GetResponse } from '../../shared/models/eras-api/eras.api';
import { ComponentData } from '../../features/heat-map/types/risk-students-variables.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeatMapService {
  private apiUrl = `${environment.apiUrl}/api/v1/HeatMap`;

  constructor(private http: HttpClient) {}

  getStudentHeatMapDetails(component: ComponentValueType) {
    const params = new HttpParams().set('component', component);
    return this.http.get<RiskStudentDetailType[]>(
      `${this.apiUrl}/heatmap-details`,
      { params }
    );
  }

  getStudentHeatMapVariables(componentName: string, pollUUID: string) {
    return this.http.get<GetResponse<ComponentData>>(
      `${this.apiUrl}/components/${componentName}/polls/${pollUUID}/variables`
    );
  }
  getSummaryData(pollId: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/summary/polls/${pollId}`);
  }
}
