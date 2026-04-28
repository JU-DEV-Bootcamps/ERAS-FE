import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  GENERAL_MESSAGES,
  VALIDATION_MESSAGES,
} from '@core/constants/messages';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';
import { ListImportedStudentComponent } from './list-imported-student/list-imported-student.component';
import { ServerResponse } from '@core/services/interfaces/server.type';
import {
  isStudentImportKey,
  StudentImport,
} from '@core/services/interfaces/student.interface';
import { CsvCheckerService } from '@core/services/csv-checker.service';
import { StudentService } from '@core/services/api/student.service';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';

@Component({
  selector: 'app-import-students',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    ListImportedStudentComponent,
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

  @ViewChild(ListImportedStudentComponent)
  listImportedStudentComponent!: ListImportedStudentComponent;

  constructor(
    private csvCheckerService: CsvCheckerService,
    private studentService: StudentService
  ) {}

  private openDialog(text: string, isSuccess: boolean): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    const errorDetails =
      this.csvErrors.length > 0 ? this.csvErrors : [GENERAL_MESSAGES.ERROR_500];

    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: {
        isSuccess: isSuccess,
        type: isSuccess ? 'success' : 'error',
        title: isSuccess
          ? GENERAL_MESSAGES.SUCCESS_IMPORT_TITLE
          : GENERAL_MESSAGES.ERROR_IMPORT_TITLE,
        message: isSuccess ? text : this.fileError,
        details: isSuccess ? text : errorDetails,
        action: isSuccess
          ? null
          : {
              label: 'See details',
              action: () => this.openDetailsDialog(),
            },
      },
    });
  }

  private openDetailsDialog() {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning

    this.csvErrors = this.csvCheckerService.getErrors();

    this.dialog.open(ModalComponent, {
      width: 'auto',
      height: 'auto',
      minWidth: '50vw',
      maxWidth: '80vw',
      maxHeight: '90vh',
      data: {
        type: 'error',
        title: GENERAL_MESSAGES.ERROR_IMPORT_TITLE,
        message: this.fileError,
        details: this.csvErrors,
      },
    });
  }

  importOtherFIle() {
    this.inputFile.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedFile = file;
    this.csvErrors = [];
    this.validateFile(this.selectedFile);
  }

  private rejectFile(msg: string): void {
    this.fileError = msg;
    this.selectedFile = null;
    this.inputFile.nativeElement.value = '';
    this.openDialog(GENERAL_MESSAGES.DETAILS, false);
  }

  private async validateFile(file: File): Promise<void> {
    const maxFileSize = 5 * 1024 * 1024;
    if (file.type !== 'text/csv') {
      this.rejectFile(VALIDATION_MESSAGES.INVALID_FILE_TYPE + '(.csv)');
      return;
    }
    console.log('import antuguo', file);

    if (file.size > maxFileSize) {
      this.rejectFile(VALIDATION_MESSAGES.FILE_SIZE_EXCEEDED + '(5MB)');
      return;
    }

    try {
      await this.csvCheckerService.validateCSV(file);
    } catch (err) {
      console.error(err);
      this.rejectFile(VALIDATION_MESSAGES.CSV_SCAN_ERROR);
      return;
    }

    this.csvErrors = this.csvCheckerService.getSummarizedErrors();

    if (this.csvErrors.length > 0) {
      this.csvErrors = this.processErrors(this.csvErrors);
      this.rejectFile(VALIDATION_MESSAGES.CSV_SCAN_ERROR);
      return;
    }
    this.fileError = null;
    this.importFile();
  }

  private processErrors(errors: string[]): string[] {
    const maxErrorsToShow = 5;
    const maxLength = 100;
    const processedErrors = errors.slice(0, maxErrorsToShow).map(error => {
      if (error.length > maxLength) {
        return error.substring(0, maxLength) + '...';
      }
      return error;
    });

    if (errors.length > maxErrorsToShow) {
      processedErrors.push(
        `And ${errors.length - maxErrorsToShow} more rows with errors.`,
        'See details for more information.'
      );
    }

    return processedErrors;
  }

  importFile(): void {
    if (this.selectedFile) {
      this.isLoading = true;

      const data = this.csvCheckerService.getCSVData();
      const jsonData = data.map(
        (row: Record<string, string>): StudentImport => {
          const filteredRow = {} as StudentImport;

          for (const key in row) {
            if (key !== '' && isStudentImportKey(key)) {
              const value = row[key];

              if (typeof value === 'string' && value.includes(',')) {
                row[key] = value.replace(',', '.');
              }
              filteredRow[key] = row[key];
            }
          }
          return filteredRow;
        }
      );

      this.studentService.postData(jsonData).subscribe({
        next: (response: ServerResponse) => {
          this.isLoading = false;
          this.openDialog(response.message, true);

          this.listImportedStudentComponent.loadStudents();
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
