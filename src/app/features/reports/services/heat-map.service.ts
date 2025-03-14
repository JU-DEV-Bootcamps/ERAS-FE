import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeatMapService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<string, unknown>();
  private endpoint = 'api/v1/HeatMap/components/polls';

  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDataPoll(pollUUID: string): Observable<any> {
    if (this.cache.has(pollUUID)) {
      return of(this.cache.get(pollUUID));
    } else {
      return this.http.get(`${this.apiUrl}/${this.endpoint}/${pollUUID}`).pipe(
        map(response => {
          this.cache.set(pollUUID, response);
          return response;
        })
      );
    }
  }
}
