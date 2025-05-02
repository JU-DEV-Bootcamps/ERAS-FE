import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseApiService {
  protected abstract apiUrl: string; // Each service must define its own `apiUrl`

  constructor(protected http: HttpClient) {}

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params });
  }

  post<T, R = T>(
    endpoint: string,
    body: T,
    headers?: HttpHeaders
  ): Observable<R> {
    return this.http.post<R>(`${this.apiUrl}/${endpoint}`, body, { headers });
  }

  put<T, R = T>(
    endpoint: string,
    body: T,
    headers?: HttpHeaders
  ): Observable<R> {
    return this.http.put<R>(`${this.apiUrl}/${endpoint}`, body, { headers });
  }

  delete<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, { params });
  }
}
