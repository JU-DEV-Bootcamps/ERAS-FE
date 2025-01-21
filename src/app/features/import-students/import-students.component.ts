import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-import-students',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './import-students.component.html',
  styleUrl: './import-students.component.css',
})
export class ImportStudentsComponent {
  selectedFile: File | null = null;
  fileError: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.validateFile(this.selectedFile);
    } else {
      this.selectedFile = null;
    }
  }

  validateFile(file: File): void {
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

    this.fileError = null;
  }

  importFile(): void {
    if (this.selectedFile) {
      // Add your file import logic here
      console.log('Importing file:', this.selectedFile.name);
    }
  }
}
