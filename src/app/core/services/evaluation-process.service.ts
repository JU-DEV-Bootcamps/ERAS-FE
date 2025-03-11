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
  private endpoint = 'api/v1/EvaluationProcess';

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
    console.log('creando proceso de evaluacion');
    console.log('creando proceso de evaluacion');
    console.log('creando proceso de evaluacion');
    console.log(data);
    return this.http.post(`${this.apiUrl}/${this.endpoint}`, data);
  }
  getAllEvalProc(): Observable<ReadEvaluationProcess[]> {
    return this.http.get<ReadEvaluationProcess[]>(
      `${this.apiUrl}/${this.endpoint}`
    );
  }
  deleteEvaluationProcess(id: string): Observable<ReadEvaluationProcess> {
    return this.http.delete<ReadEvaluationProcess>(
      `${this.apiUrl}/${this.endpoint}/${id}`
    ); // check if it is param or path
  }
}
