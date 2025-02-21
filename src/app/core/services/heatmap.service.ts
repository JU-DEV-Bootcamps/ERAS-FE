import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeatmapService {
  private apiUrl = environment.apiUrl;
  private endpoint = `${this.apiUrl}/api/v1/Heatmap`;

  constructor(private http: HttpClient) {}

  getSummaryData(pollId: string): Observable<unknown> {
    return this.http.get(`${this.endpoint}/summary/polls/${pollId}`);
  }
}
