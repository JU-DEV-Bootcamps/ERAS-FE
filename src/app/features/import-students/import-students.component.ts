import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CsvCheckerService } from '../../core/services/csv-checker.service';
import { ImportStudentService } from '../../core/services/import-students.service';
import { MatDialog } from '@angular/material/dialog';
import { ImportDialogComponent } from './components/import-dialog.component';
import {
  GENERAL_MESSAGES,
  IMPORT_MESSAGES,
  VALIDATION_MESSAGES,
} from '../../core/constants/messages';

@Component({
  selector: 'app-import-students',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './import-students.component.html',
  styleUrl: './import-students.component.css',
})
export class ImportStudentsComponent {
  selectedFile: File | null = null;
  fileError: string | null = null;
  csvErrors: string[] = [];
  readonly dialog = inject(MatDialog);

  constructor(
    private csvCheckerService: CsvCheckerService,
    private importService: ImportStudentService
  ) {}

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
      return;
    }

    this.fileError = null;
  }

  private processErrors(errors: string[]): string[] {
    const maxErrorsToShow = 4;
    const maxLength = 140;
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
        next: () => {
          this.openDialog(IMPORT_MESSAGES.STUDENT_SUCCESS, true);
        },
        error: () => {
          this.openDialog(IMPORT_MESSAGES.STUDENT_ERROR, false);
        },
      });
    }
  }
  private openDialog(text: string, isSuccess: boolean): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ImportDialogComponent, {
      data: {
        title: isSuccess
          ? GENERAL_MESSAGES.SUCCESS_TITLE
          : GENERAL_MESSAGES.ERROR_TITLE,
        message: text,
        isSuccess: isSuccess,
      },
    });
  }
}
