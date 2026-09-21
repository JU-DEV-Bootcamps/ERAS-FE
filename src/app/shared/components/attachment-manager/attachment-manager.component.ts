import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
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
  StagedFile,
} from '@core/models/attachment.model';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormUtils } from '@core/utils/forms/form-utils';
import { FileValidationService } from '@core/utils/file/file-validation.service';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
} from '@modules/assessments/components/interventions/interventions.constants';

@Component({
  standalone: true,
  selector: 'app-attachment-manager',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './attachment-manager.component.html',
  styleUrl: './attachment-manager.component.scss',
})
export class AttachmentManagerComponent implements OnInit {
  private readonly attachmentApi = inject(AttachmentApiService);
  private readonly fileValidation = inject(FileValidationService);

  entityType = input.required<string>();
  entityId = input<number | null>(null);

  maxFiles = input<number>(5);
  maxSizeMb = input<number>(10_485_760);
  allowedMimeTypes = input<string[]>(ALLOWED_MIME_TYPES);
  allowedExtensions = input<string>(ALLOWED_EXTENSIONS);

  existingAttachments = signal<AttachmentModel[]>([]);
  markedForRemoval = signal<Set<number>>(new Set());
  stagedFiles = signal<StagedFile[]>([]);
  isLoadingExisting = signal(false);
  errorMessage = signal<string | null>(null);
  stagedFilesChange = output<StagedFile[]>();

  private draftSessionId: number | null = null;
  private draftSessionPending = false;
  hostControl = input<AbstractControl | null>(null);

  readonly display = ATTACHMENT_DISPLAY;

  readonly visibleExisting = computed(() =>
    this.existingAttachments().filter(a => !this.markedForRemoval().has(a.id))
  );

  readonly hasAnyContent = computed(
    () => this.visibleExisting().length > 0 || this.stagedFiles().length > 0
  );

  hasErrors = computed(() => this.errorMessage() !== null);

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
    this.notifyFormControl();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    input.value = '';
    let accumulatedErrors: ValidationErrors = {};

    const currentFiles = this.stagedFiles().map(s => s.file);
    const currentTotalCount =
      this.visibleExisting().length + this.stagedFiles().length;

    const currentFileNames = currentFiles.map(s => s.name);
    const existingFileNames = this.visibleExisting().map(
      s => s.originalFileName
    );
    const validFiles: File[] = [];
    for (const file of files) {
      const errors = this.fileValidation.validate(
        file,
        [...currentFileNames, ...existingFileNames],
        currentTotalCount,
        {
          maxFiles: this.maxFiles(),
          maxSizeMb: this.maxSizeMb(),
          allowedMimeTypes: this.allowedMimeTypes(),
          allowedExtensions: this.allowedExtensions(),
        }
      );

      if (errors) {
        accumulatedErrors = { ...accumulatedErrors, ...errors };
      } else {
        validFiles.push(file);
        currentFiles.push(file);
      }
    }
    if (Object.keys(accumulatedErrors).length > 0) {
      this.errorMessage.set(
        FormUtils.getTextError(accumulatedErrors, 'Attached Document (s)')
      );
    } else {
      this.errorMessage.set(null);
    }

    if (validFiles.length > 0) {
      this.stageFiles(validFiles);
    }
  }

  private stageFiles(files: File[]): void {
    if (!this.draftSessionId && !this.draftSessionPending) {
      this.draftSessionPending = true;
      this.attachmentApi.createDraftSession().subscribe({
        next: response => {
          this.draftSessionId = response.draftId;
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

  private addStagedPlaceholder(file: File) {
    const localId = `${file.name}-${Date.now()}`;
    const staged: StagedFile = {
      localId: localId,
      file,
      attachmentId: null,
      status: 'uploading',
    };
    this.stagedFiles.update(prev => [...prev, staged]);
  }

  private uploadOneFile(file: File): void {
    const draftId = this.draftSessionId!;
    this.attachmentApi.upload('Temp', draftId, [file]).subscribe({
      next: response => {
        this.stagedFiles.update(prev =>
          prev.map(s =>
            s.file === file
              ? { ...s, attachmentId: response[0].id, status: 'done' }
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

  private notifyFormControl(): void {
    const control = this.hostControl();
    if (!control) return;

    const hasUploading = this.stagedFiles().some(s => s.status === 'uploading');
    const hasUploadError = this.stagedFiles().some(s => s.status === 'error');
    const hasPendingChanges =
      this.stagedFiles().length > 0 || this.markedForRemoval().size > 0;

    if (hasUploading) {
      control.setErrors({ uploading: true });
    } else if (hasUploadError) {
      control.setErrors({ uploadError: true });
    } else {
      control.setErrors(null);
    }

    if (hasPendingChanges) {
      control.markAsDirty();
      control.markAsTouched();
    }
  }
}
