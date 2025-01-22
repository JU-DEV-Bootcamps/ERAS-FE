import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CsvCheckerService } from '../../core/services/csv-checker.service';

@Component({
  selector: 'app-import-students',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './import-students.component.html',
  styleUrl: './import-students.component.css',
})
export class ImportStudentsComponent {
  selectedFile: File | null = null;
  fileError: string | null = null;

  constructor(private csvCheckerService: CsvCheckerService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.validateFile(this.selectedFile);
    } else {
      this.selectedFile = null;
    }
  }

  async validateFile(file: File): Promise<void> {
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
    const errors = this.csvCheckerService.getErrors();
    if (errors.length > 0) {
      this.fileError = "Pre-scan: There are errors in the file's content.";
      console.error(errors);
      return;
    }

    this.fileError = null;
  }

  getKeys(data: Record<string, unknown>): string[] {
    return data ? Object.keys(data) : [];
  }

  importFile(): void {
    if (this.selectedFile) {
      const data = this.csvCheckerService.getCSVData();
      const jsonData = data.map((row: Record<string, unknown>) => {
        const filteredRow: Record<string, unknown> = {};
        for (const key in row) {
          // Irrelevant index column
          if (key !== '') {
            filteredRow[key] = row[key];
          }
        }
        return filteredRow;
      });

      console.log(jsonData);
      /**
       * DELETE THIS CODE LINES - ONLY FOR TESTING
       */
    }
  }
}
