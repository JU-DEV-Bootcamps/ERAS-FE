import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CsvCheckerService } from '../../core/services/csv-checker.service';
import { ImportStudentService } from '../../core/services/import-students.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  GENERAL_MESSAGES,
  VALIDATION_MESSAGES,
} from '../../core/constants/messages';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalComponent } from '../../shared/components/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-import-students',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './import-students.component.html',
  styleUrl: './import-students.component.scss',
})
export class ImportStudentsComponent {
  selectedFile: File | null = null;
  fileError: string | null = null;
  csvErrors: string[] = [];
  isLoading = false;

  readonly dialog = inject(MatDialog);
  @ViewChild('fileInput')
  inputFile!: ElementRef<HTMLInputElement>;

  constructor(
    private csvCheckerService: CsvCheckerService,
    private importService: ImportStudentService
  ) {}

  private openDialog(text: string, isSuccess: boolean): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      width: '450px',
      height: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        isSuccess: isSuccess,
        title: isSuccess
          ? GENERAL_MESSAGES.SUCCESS_IMPORT_TITLE
          : GENERAL_MESSAGES.ERROR_IMPORT_TITLE,
        success: {
          details: text,
        },
        error: {
          title: this.fileError != null ? this.fileError : text,
          details:
            this.csvErrors.length > 0
              ? this.csvErrors
              : [GENERAL_MESSAGES.ERROR_500],
          message: `${text} ${this.selectedFile?.name}`,
        },
      },
    });
  }

  importOtherFIle() {
    this.inputFile.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.csvErrors = []; // Reset errors
      this.validateFile(this.selectedFile);
    }
  }

  private async validateFile(file: File): Promise<void> {
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxFileSize) {
      this.fileError = VALIDATION_MESSAGES.FILE_SIZE_EXCEEDED + '(5MB)';
      this.selectedFile = null;
      return;
    }

    if (file.type !== 'text/csv') {
      this.fileError = VALIDATION_MESSAGES.INVALID_FILE_TYPE + '(.csv)';
      this.selectedFile = null;
      return;
    }
    // Pre-scan Papaparse to check for errors
    await this.csvCheckerService.validateCSV(file);
    this.csvErrors = this.csvCheckerService.getErrors();
    if (this.csvErrors.length > 0) {
      this.fileError = VALIDATION_MESSAGES.CSV_SCAN_ERROR;
      this.csvErrors = this.processErrors(this.csvErrors);
      this.openDialog(GENERAL_MESSAGES.DETAILS, false);
      return;
    }
    this.fileError = null;
    this.importFile();
  }

  private processErrors(errors: string[]): string[] {
    const maxErrorsToShow = 3;
    const maxLength = 100;
    const processedErrors = errors.slice(0, maxErrorsToShow).map(error => {
      if (error.length > maxLength) {
        return error.substring(0, maxLength) + '...';
      }
      return error;
    });

    if (errors.length > maxErrorsToShow) {
      processedErrors.push(
        `And ${errors.length - maxErrorsToShow} more rows with errors...`
      );
    }

    return processedErrors;
  }

  importFile(): void {
    if (this.selectedFile) {
      this.isLoading = true;
      const data = this.csvCheckerService.getCSVData();
      const jsonData = data.map((row: Record<string, unknown>) => {
        const filteredRow: Record<string, unknown> = {};
        for (const key in row) {
          // Filter irrelevant index column
          if (key !== '') {
            filteredRow[key] = row[key];
          }
        }
        return filteredRow;
      });

      this.importService.postData(jsonData).subscribe({
        next: response => {
          this.isLoading = false;
          this.openDialog(response.message, true);
        },
        error: error => {
          this.isLoading = false;
          if (error.status == 500) {
            this.openDialog(GENERAL_MESSAGES.ERROR_500, false);
          } else {
            this.openDialog(
              GENERAL_MESSAGES.ERROR_UNKNOWN + error.message,
              false
            );
          }
        },
      });
    }
  }
}
