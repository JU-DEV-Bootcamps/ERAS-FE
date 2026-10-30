import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserManualModel } from '@core/models/user-manual.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserManualsApiService extends BaseApiService {
  protected resource = 'manuals';

  list(): Observable<UserManualModel[]> {
    return this.get<UserManualModel[]>('');
  }

  download(id: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${this.resource}/${encodeURIComponent(id)}/download`,
      { responseType: 'blob' }
    );
  }
}
