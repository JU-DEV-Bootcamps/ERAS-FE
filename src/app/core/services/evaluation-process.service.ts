/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentPoll } from '../../shared/models/polls/student-polls.model';
import {
  CreateEvaluationProcess,
  ReadEvaluationProcess,
} from '../../shared/models/EvaluationProcess';

@Injectable({
  providedIn: 'root',
})
export class EvaluationProcessService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Evaluation';

  constructor(private http: HttpClient) {}

  getEvalProcSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/summary`);
  }

  getPollsByStudentId(studentId: number): Observable<StudentPoll[]> {
    return this.http.get<StudentPoll[]>(
      `${this.apiUrl}/${this.endpoint}/student/${studentId}`
    );
  }
  createEvalProc(data: CreateEvaluationProcess): Observable<any> {
    console.log(data);
    return this.http.post(`${this.apiUrl}/${this.endpoint}`, data);
  }
  getAllEvalProc(): Observable<ReadEvaluationProcess[]> {
    return this.http.get<ReadEvaluationProcess[]>(
      `${this.apiUrl}/${this.endpoint}`
    );
  }
  updateEvaluationProcess(evaluation :ReadEvaluationProcess): Observable<ReadEvaluationProcess>{
    return this.http.put<ReadEvaluationProcess>(
      `${this.apiUrl}/${this.endpoint}/${evaluation.Id}`, evaluation );
  }
  deleteEvaluationProcess(id: string): Observable<ReadEvaluationProcess> {
    return this.http.delete<ReadEvaluationProcess>(
      `${this.apiUrl}/${this.endpoint}/${id}`
    );
  }
}
