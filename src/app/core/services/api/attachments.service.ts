import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { AttachmentModel } from '@core/models/attachment.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AttachmentApiService extends BaseApiService {
  protected resource = 'attachments';

  upload(entityType: string, entityId: number, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('Files', file);
    });
    const params = new HttpParams()
      .set('EntityType', entityType)
      .set('EntityId', entityId);
    return this.post<FormData, AttachmentModel>(
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

  download(attachmentId: number) {
    return this.get(`${attachmentId}/download`);
  }

  deleteAttachment(attachmentId: number) {
    return this.delete<void>(`${attachmentId}`);
  }

  createDraftSession(): Observable<number> {
    return this.post<void, number>('/drafts', undefined);
  }
}
