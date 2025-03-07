import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cohort } from '../../shared/models/Cohort';

@Injectable({
  providedIn: 'root',
})
export class CohortService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Cohorts';

  constructor(private http: HttpClient) {}
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCohorts(): Observable<Cohort[]> {
    return this.http.get<Cohort[]>(`${this.apiUrl}/${this.endpoint}`);
  }
} 