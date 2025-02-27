import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Polls';
  private cosmicLattePath = 'api/v1/CosmicLatte/polls';

  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDataPollList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  savePollsCosmicLattePreview(data: any) {
    return this.http.post(`${this.apiUrl}/${this.cosmicLattePath}`, data);
  }
}
