// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-attachment-manager',
//   imports: [],
//   templateUrl: './attachment-manager.component.html',
//   styleUrl: './attachment-manager.component.scss',
// })
// export class AttachmentManagerComponent {

// }
// attachment-manager.component.ts
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AttachmentApiService } from '@core/services/api/attachments.service';
import {
  ATTACHMENT_DISPLAY,
  AttachmentModel,
} from '@core/models/attachment.model';

interface StagedFile {
  localId: string;
  file: File;
  attachmentId: number | null;
  status: 'uploading' | 'done' | 'error';
}

@Component({
  standalone: true,
  selector: 'app-attachment-manager',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './attachment-manager.component.html',
  styleUrl: './attachment-manager.component.scss',
})
export class AttachmentManagerComponent implements OnInit {
  private readonly attachmentApi = inject(AttachmentApiService);

  entityType = input.required<string>();
  entityId = input<number | null>(null);

  existingAttachments = signal<AttachmentModel[]>([]);
  markedForRemoval = signal<Set<number>>(new Set());
  stagedFiles = signal<StagedFile[]>([]);
  isLoadingExisting = signal(false);

  private draftSessionId: number | null = null;
  private draftSessionPending = false;

  readonly display = ATTACHMENT_DISPLAY;

  readonly visibleExisting = computed(() =>
    this.existingAttachments().filter(a => !this.markedForRemoval().has(a.id))
  );

  readonly hasAnyContent = computed(
    () => this.visibleExisting().length > 0 || this.stagedFiles().length > 0
  );

  ngOnInit(): void {
    const id = this.entityId();
    if (id !== null) {
      this.loadExisting(this.entityType(), id);
    }
  }

  private loadExisting(entityType: string, entityId: number): void {
    this.isLoadingExisting.set(true);
    this.attachmentApi.list(entityType, entityId).subscribe({
      next: attachments => {
        this.existingAttachments.set(attachments);
        this.isLoadingExisting.set(false);
      },
      error: () => {
        this.isLoadingExisting.set(false);
      },
    });
  }

  toggleRemoveExisting(attachmentId: number): void {
    this.markedForRemoval.update(prev => {
      const next = new Set(prev);
      if (next.has(attachmentId)) {
        next.delete(attachmentId);
      } else {
        next.add(attachmentId);
      }
      return next;
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    input.value = '';
    this.stageFiles(files);
  }

  private stageFiles(files: File[]): void {
    if (!this.draftSessionId && !this.draftSessionPending) {
      this.draftSessionPending = true;
      this.attachmentApi.createDraftSession().subscribe({
        next: draftId => {
          this.draftSessionId = draftId;
          this.draftSessionPending = false;
          files.forEach(f => this.uploadOneFile(f));
        },
        error: () => {
          this.draftSessionPending = false;
          files.forEach(f => this.markFileError(f));
        },
      });
      files.forEach(f => this.addStagedPlaceholder(f));
    } else if (this.draftSessionId) {
      files.forEach(f => {
        this.addStagedPlaceholder(f);
        this.uploadOneFile(f);
      });
    } else {
      files.forEach(f => this.addStagedPlaceholder(f));
    }
  }

  private addStagedPlaceholder(file: File): void {
    const staged: StagedFile = {
      localId: `${file.name}-${Date.now()}`,
      file,
      attachmentId: null,
      status: 'uploading',
    };
    this.stagedFiles.update(prev => [...prev, staged]);
  }

  private uploadOneFile(file: File): void {
    const draftId = this.draftSessionId!;
    this.attachmentApi.upload('Temp', draftId, [file]).subscribe({
      next: attachment => {
        this.stagedFiles.update(prev =>
          prev.map(s =>
            s.file === file
              ? { ...s, attachmentId: attachment.id, status: 'done' }
              : s
          )
        );
      },
      error: () => {
        this.stagedFiles.update(prev =>
          prev.map(s => (s.file === file ? { ...s, status: 'error' } : s))
        );
      },
    });
  }

  private markFileError(file: File): void {
    this.stagedFiles.update(prev =>
      prev.map(s => (s.file === file ? { ...s, status: 'error' } : s))
    );
  }

  retryUpload(staged: StagedFile): void {
    if (!this.draftSessionId) return;
    this.stagedFiles.update(prev =>
      prev.map(s =>
        s.localId === staged.localId ? { ...s, status: 'uploading' } : s
      )
    );
    this.uploadOneFile(staged.file);
  }

  removeStaged(staged: StagedFile): void {
    if (staged.attachmentId !== null) {
      this.attachmentApi.deleteAttachment(staged.attachmentId).subscribe();
    }
    this.stagedFiles.update(prev =>
      prev.filter(s => s.localId !== staged.localId)
    );
  }

  getPendingChanges(): {
    draftSessionId: number | null;
    attachmentIdsToRemove: number[];
  } {
    return {
      draftSessionId: this.draftSessionId,
      attachmentIdsToRemove: [...this.markedForRemoval()],
    };
  }
}
