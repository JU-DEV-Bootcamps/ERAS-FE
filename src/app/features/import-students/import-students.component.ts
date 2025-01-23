import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CsvCheckerService } from '../../core/services/csv-checker.service';
import { ImportStudentService } from '../../core/services/import-students.service';

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
      this.fileError = 'File size exceeds the maximum limit of 5MB.';
      this.selectedFile = null;
      return;
    }

    if (file.type !== 'text/csv') {
      this.fileError = 'Invalid file type, please select a CSV file.';
      this.selectedFile = null;
      return;
    }

    // Pre-scan Papaparse to check for errors
    await this.csvCheckerService.validateCSV(file);
    this.csvErrors = this.csvCheckerService.getErrors();
    if (this.csvErrors.length > 0) {
      this.fileError = "CSV Scan: Errors detected in the file's content.";
      this.csvErrors = this.processErrors(this.csvErrors);
      return;
    }

    this.fileError = null;
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
      console.log(jsonData);
      this.importService.postData(jsonData).subscribe({
        next: response => {
          console.log('API call successful:', response);
        },
        error: error => {
          console.error('API call failed:', error);
        },
      });
    }
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
}
