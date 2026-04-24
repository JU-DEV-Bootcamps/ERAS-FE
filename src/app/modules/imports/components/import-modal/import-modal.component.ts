import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';

export interface ImportModalConfig {
  /** Dialog title */
  title: string;
  /** Accepted MIME type(s), e.g. 'text/csv' */
  acceptedMimeType: string;
  /** Human-readable file extension hint shown under the browse link, e.g. '(.csv)' */
  acceptedExtensionLabel: string;
  /** Max file size in bytes (default: 5 MB) */
  maxFileSizeBytes?: number;
  /** Description paragraph shown below the drop-zone */
  description?: string;
  /** Optional URL for a downloadable template */
  templateUrl?: string;
  /** Label for the template link (default: 'example template') */
  templateLabel?: string;
}

export interface ImportModalResult {
  file: File;
}

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './import-modal.component.html',
  styleUrl: './import-modal.component.scss',
})
export class ImportModalComponent implements OnDestroy {
  // ── Inputs ──────────────────────────────────────────────────────────────────

  /** Configuration object injected by the parent dialog opener via MAT_DIALOG_DATA
   *  or bound directly when used as a standalone component.
   */
  @Input() config!: ImportModalConfig;

  /** When true the spinner overlay is visible */
  @Input() isLoading = false;

  // ── Outputs ─────────────────────────────────────────────────────────────────

  /** Emitted once the user has selected a valid file and clicked "Import" */
  @Output() fileSelected = new EventEmitter<File>();

  /** Emitted when the user clicks "Cancel" */
  @Output() cancelled = new EventEmitter<void>();

  // ── Internal state ───────────────────────────────────────────────────────────

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  fileError: string | null = null;
  isDragOver = false;

  /** Optional reference to a MatDialogRef so the component can close itself */
  dialogRef?: MatDialogRef<ImportModalComponent>;

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  // ── File Input ───────────────────────────────────────────────────────────────

  openFileBrowser(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
    // Reset value so the same file can be re-selected
    input.value = '';
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  private processFile(file: File): void {
    this.fileError = null;
    this.selectedFile = null;

    const maxSize = this.config.maxFileSizeBytes ?? 5 * 1024 * 1024;

    if (file.type !== this.config.acceptedMimeType) {
      this.fileError = `Invalid file type. Please upload a ${this.config.acceptedExtensionLabel} file.`;
      return;
    }

    if (file.size > maxSize) {
      const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
      this.fileError = `File exceeds the maximum size of ${maxMb} MB.`;
      return;
    }

    this.selectedFile = file;
  }

  get fileSizeLabel(): string {
    if (!this.selectedFile) return '';
    const kb = this.selectedFile.size / 1024;
    return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  onImport(): void {
    if (!this.selectedFile || this.isLoading) return;
    this.fileSelected.emit(this.selectedFile);
  }

  onCancel(): void {
    this.cancelled.emit();
    this.dialogRef?.close();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = null;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    // no-op – clean extension point
    console.log('gg');
  }
}
