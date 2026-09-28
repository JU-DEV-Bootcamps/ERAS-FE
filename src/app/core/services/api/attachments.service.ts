import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { AttachmentModel, DraftModel } from '@core/models/attachment.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AttachmentApiService extends BaseApiService {
  protected resource = 'attachments';

  upload(
    entityType: string,
    entityId: number,
    files: File[]
  ): Observable<AttachmentModel[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('Files', file);
    });
    const params = new HttpParams()
      .set('EntityType', entityType)
      .set('EntityId', entityId);
    return this.post<FormData, AttachmentModel[]>(
      `?${params.toString()}`,
      formData
    );
  }

  list(entityType: string, entityId: number) {
    const params = new HttpParams()
      .set('EntityType', entityType)
      .set('EntityId', entityId);
    return this.get<AttachmentModel[]>('', params);
  }

  downloadAttachment(attachmentId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    );
  }

  deleteAttachment(attachmentId: number) {
    return this.delete<void>(`${attachmentId}`);
  }

  createDraftSession(): Observable<DraftModel> {
    return this.post<void, DraftModel>('drafts', undefined);
  }
}
