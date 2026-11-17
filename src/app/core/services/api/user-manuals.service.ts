import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { UserManualModel } from '@core/models/user-manual.model';
import {
  USER_MANUAL_ERROR_CODES,
  UserManualErrorCode,
  UserManualsApiError,
} from '@core/models/user-manual-error.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserManualsApiService extends BaseApiService {
  protected resource = 'manuals';

  list(): Observable<UserManualModel[]> {
    return this.get<UserManualModel[]>('').pipe(
      catchError(error => this.toApiError(error))
    );
  }

  download(id: string): Observable<Blob> {
    return this.http
      .get(
        `${this.apiUrl}/${this.resource}/${encodeURIComponent(id)}/download`,
        {
          responseType: 'blob',
        }
      )
      .pipe(catchError(error => this.toApiError(error)));
  }

  private toApiError(error: unknown): Observable<never> {
    const body = error instanceof HttpErrorResponse ? error.error : null;
    return from(this.readCode(body)).pipe(
      switchMap(code => throwError(() => new UserManualsApiError(code)))
    );
  }

  /** The body is JSON `{ code, message }`; a download arrives as a Blob, so it is read as text first. */
  private async readCode(body: unknown): Promise<UserManualErrorCode | null> {
    let payload = body;
    if (payload instanceof Blob) payload = await payload.text();
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        return null;
      }
    }
    const code = (payload as { code?: unknown } | null)?.code;
    return USER_MANUAL_ERROR_CODES.find(known => known === code) ?? null;
  }
}
