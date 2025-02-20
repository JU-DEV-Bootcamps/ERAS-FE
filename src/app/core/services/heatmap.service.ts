import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeatmapService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/Heatmap';

  constructor(private http: HttpClient) {}

  getSummaryData(pollId: string): Observable<unknown> {
    return this.http.get(
      `${this.apiUrl}/${this.endpoint}/summary/polls/${pollId}`
    );
  }
}
