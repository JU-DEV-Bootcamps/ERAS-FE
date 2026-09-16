import { BaseModel } from './common/base.model';

export interface AttachmentModel extends BaseModel {
  entityType: string;
  entityId: number;
  originalFileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  contentHash: string;
  createdAtUtc: string;
  createdBy: string;
  storageKey: string;
  storageProvider: string;
}

export const ATTACHMENT_DISPLAY = {
  fileName: (a: AttachmentModel): string =>
    a.originalFileName ?? 'Unknown file',
  mimeType: (a: AttachmentModel): string =>
    a.mimeType ?? 'application/octet-stream',
  size: (a: AttachmentModel): string =>
    a.sizeBytes != null ? formatBytes(a.sizeBytes) : '—',
} as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
