import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';
import { ImportModalConfig } from '@core/models/import-modal-config.model';

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './import-modal.component.html',
  styleUrl: './import-modal.component.scss',
})
export class ImportModalComponent {
  @Input() config!: ImportModalConfig;
  @Input() isLoading = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  fileError: string | null = null;
  isDragOver = false;

  dialogRef?: MatDialogRef<ImportModalComponent>;

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

  openFileBrowser(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
    input.value = '';
  }

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
}
