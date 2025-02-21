import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeatMapService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/HeatMap/components/polls';

  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDataPoll(pollUUID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/${pollUUID}`);
  }
}
