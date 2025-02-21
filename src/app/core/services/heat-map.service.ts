import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ComponentValueType,
  RiskStudentDetailType,
} from '../../features/heat-map/types/risk-students-detail.type';

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
}
