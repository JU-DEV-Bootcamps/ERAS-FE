import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationSummaryModel } from '../models/SummaryModel';

@Injectable({
  providedIn: 'root',
})
export class EvaluationProcessService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Evaluation';

  constructor(private http: HttpClient) {}

  getEvalProcSummary(): Observable<EvaluationSummaryModel> {
    return this.http.get<EvaluationSummaryModel>(
      `${this.apiUrl}/${this.endpoint}/summary`
    );
  }
}
