import { Component, inject, OnInit, viewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EventAction, EventLoad } from '@core/models/load';
import { StudentModel, StudentModelFlat } from '@core/models/student.model';
import { StudentService } from '@core/services/api/student.service';
import {
  Pagination,
  ServerResponse,
} from '@core/services/interfaces/server.type';
import { ListComponent } from '@shared/components/list/list.component';
import { ActionDatas } from '@shared/components/list/types/action';
import { Column } from '@shared/components/list/types/column';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { LastAccessPipe } from '@shared/pipes/last-access.pipe';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ComponentType } from '@angular/cdk/portal';
import { ImportModalComponent } from '@modules/imports/components/import-modal/import-modal.component';
import { CSV_IMPORT_CONFIG } from '@shared/components/modals/modal-drag-and-drop/modalConfig';
import { CsvCheckerService } from '@core/services/csv-checker.service';
import { ImportPreviewStudentsComponent } from '@modules/imports/components/import-preview-students/import-preview-students.component';
import {
  ImportPreviewConfirm,
  StudentModelPreview,
} from '@shared/components/list/types/preview';
import { parseJsonRows, parseRowErrors } from '@core/utils/helpers/parsers';
import {
  CSV_KEY_TO_MODEL_KEY,
  MandatoryColumns,
  OptionalColumns,
} from '@modules/imports/components/import-preview-students/import-preview-students.model';
import { StudentImport } from '@core/services/interfaces/student.interface';
import { GENERAL_MESSAGES } from '@core/constants/messages';
import { openDialogWithStatus } from '@modules/imports/utils/dialogWithStatus';

@Component({
  selector: 'app-students-list',
  imports: [
    ErasButtonComponent,
    ListComponent,
    MatProgressSpinner,
    MatMenuModule,
  ],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss',
})
export class StudentsListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly lastAccessPipe = new LastAccessPipe();
  private readonly featureFlags = inject(FeatureFlagsService);

  private readonly list = viewChild(ListComponent);

  dataStudents = new MatTableDataSource<StudentModelFlat>([]);
  students: StudentModelFlat[] = [];
  totalStudents = 0;
  pagination: Pagination = {
    pageSize: 10,
    page: 0,
  };
  isLoading = true;
  itemsAreSelectable = true;
  isGenerating = false;

  columns: Column<StudentModelFlat>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'timeDeliveryRate',
      label: 'Timely Submissions',
    },
    {
      key: 'avgScore',
      label: 'Avg. Score',
    },
    {
      key: 'lastAccessDays',
      label: 'Last Access',
      pipe: this.lastAccessPipe,
      pipeKey: 'lastAccessDays',
    },
  ];
  actionDatas: ActionDatas = [
    {
      columnId: 'actions',
      id: 'checkDetails',
      label: 'Actions',
      ngIconName: 'visibility',
      tooltip: 'See more details',
    },
  ];

  constructor(private csvCheckerService: CsvCheckerService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getData(this.pagination).subscribe({
      next: data => {
        const flatStudents = this.flattenStudentModel(data.items);
        this.dataStudents = new MatTableDataSource(flatStudents);
        const existingStudents = [...this.students];
        this.students = flatStudents.map(student => {
          const existingStudent = existingStudents.find(
            existingStudent => existingStudent.id === student.id
          );

          return {
            ...student,
            isSelected: existingStudent ? existingStudent.isSelected : false,
          };
        });
        this.totalStudents = data.count;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  handleLoadCalled(event: EventLoad) {
    this.pagination = {
      page: event.page,
      pageSize: event.pageSize,
    };
    this.loadStudents();
  }

  handleActionCalled(event: EventAction): void {
    const studentItem = event.item as Partial<StudentModel>;
    const student = this.students.find(s => {
      return s.id === studentItem.id!;
    });

    if (student) {
      this.openStudentDetails(student);
    } else {
      console.warn('Student not found on array.');
    }
  }

  onPageChange(pagination: PageEvent): void {
    this.pagination = {
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    this.loadStudents();
  }

  openStudentDetails(student: StudentModelFlat): void {
    const showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.studentDetails);
    const component: ComponentType<object> = showV2
      ? ModalStudentDetailV2Component
      : ModalStudentDetailComponent;
    this.dialog.open(component, {
      width: '1152px',
      maxWidth: '95vw',
      maxHeight: '921.59px',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: student.id },
    });
  }

  exportToCSV() {
    if (this.isGenerating) return;

    this.isGenerating = true;
    this.list()?.exportToCSV();
    this.isGenerating = false;
  }

  async exportToPdf() {
    if (this.isGenerating) return;

    this.isGenerating = true;
    this.list()?.exportToPdf();
    this.isGenerating = false;
  }

  private flattenStudentModel(data: StudentModel[]): StudentModelFlat[] {
    return data.map(student => ({
      uuid: student.uuid,
      name: student.name,
      email: student.email,
      isImported: student.isImported,
      cohortId: student.cohortId,
      cohort: student.cohort,
      studentId: student.studentDetail.studentId,
      enrolledCourses: student.studentDetail.enrolledCourses,
      gradedCourses: student.studentDetail.gradedCourses,
      timeDeliveryRate: student.studentDetail.timeDeliveryRate,
      avgScore: student.studentDetail.avgScore,
      coursesUnderAvg: student.studentDetail.coursesUnderAvg,
      pureScoreDiff: student.studentDetail.pureScoreDiff,
      standardScoreDiff: student.studentDetail.standardScoreDiff,
      lastAccessDays: student.studentDetail.lastAccessDays,
      isSelected: student.isSelected,
      audit: student.audit,
      id: student.id,
    }));
  }

  openImportModal(): void {
    const dialogRef: MatDialogRef<ImportModalComponent> = this.dialog.open(
      ImportModalComponent,
      {
        maxWidth: '80vw',
        maxHeight: '90vh',
        panelClass: 'import-modal-dialog',
      }
    );
    const instance = dialogRef.componentInstance;
    instance.config = CSV_IMPORT_CONFIG;
    instance.dialogRef = dialogRef;

    instance.fileSelected.subscribe((file: File) => {
      instance.isLoading = true;
      this.handlePreviewImport(file, instance, dialogRef);
    });
  }

  private async handlePreviewImport(
    file: File,
    instance: ImportModalComponent,
    dialogRef: MatDialogRef<ImportModalComponent>
  ): Promise<void> {
    try {
      await this.csvCheckerService.validateCSV(file);
    } catch {
      instance.isLoading = false;
      return;
    }
    const rawRows: Record<string, string>[] =
      this.csvCheckerService.getCSVData();
    const rowErrorMap = parseRowErrors(this.csvCheckerService.getErrors());

    const presentCsvKeys = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    const detectedOptionalColumns = OptionalColumns.filter(col => {
      const csvKey = Object.entries(CSV_KEY_TO_MODEL_KEY).find(
        ([, modelKey]) => modelKey === col.key
      )?.[0];
      return csvKey ? presentCsvKeys.includes(csvKey) : false;
    });

    const previewRows = rawRows.map((row, i) => ({
      data: this.convertToModel(row),
      errors: rowErrorMap.get(i) ?? [],
    }));

    instance.isLoading = false;
    dialogRef.close();

    const previewRef: MatDialogRef<ImportPreviewStudentsComponent> =
      this.dialog.open(ImportPreviewStudentsComponent, {
        maxWidth: '80vw',
        maxHeight: '90vh',
        panelClass: 'import-preview-students-dialog',
      });

    const preview = previewRef.componentInstance;
    preview.title = 'Import Students';
    preview.rows = previewRows;
    preview.columns = [...MandatoryColumns, ...detectedOptionalColumns];
    preview.dialogRef = previewRef;
    preview.cancelled.subscribe(() => this.openImportModal());

    const jsonData = parseJsonRows(rawRows);

    preview.confirmed.subscribe((result: ImportPreviewConfirm) => {
      preview.isLoading = true;
      this.submitImport(result.rows, jsonData, preview, previewRef);
    });
  }

  private submitImport(
    rows: StudentModelFlat[],
    json: StudentImport[],
    preview: ImportPreviewStudentsComponent,
    previewRef: MatDialogRef<ImportPreviewStudentsComponent>
  ): void {
    const jsonRequired = json.filter(rowJson =>
      rows.some(row => row.uuid === rowJson.SISId)
    );
    const fileErrors = '';
    this.studentService.postData(jsonRequired).subscribe({
      next: (response: ServerResponse) => {
        this.isLoading = false;
        previewRef.close();
        openDialogWithStatus(
          response.message,
          true,
          [],
          fileErrors,
          this.dialog
        );
        this.loadStudents();
      },
      error: error => {
        this.isLoading = false;
        previewRef.close();
        if (error.status == 500) {
          openDialogWithStatus(
            GENERAL_MESSAGES.ERROR_500,
            false,
            [],
            fileErrors,
            this.dialog
          );
        } else {
          openDialogWithStatus(
            GENERAL_MESSAGES.ERROR_UNKNOWN + error.message,
            false,
            [],
            fileErrors,
            this.dialog
          );
        }
      },
    });
  }

  private convertToModel(row: Record<string, string>): StudentModelPreview {
    return {
      studentId: parseInt(row['Id']),
      enrolledCourses: parseInt(row['EnrolledCourses']),
      gradedCourses: parseInt(row['GradedCourses']),
      timeDeliveryRate: parseFloat(row['TimelySubmissions']),
      avgScore: parseFloat(row['AverageScore']),
      coursesUnderAvg: parseFloat(row['CoursesBelowAverage']),
      pureScoreDiff: parseFloat(row['RawScoreDifference']),
      standardScoreDiff: parseFloat(row['StandardScoreDifference']),
      lastAccessDays: parseFloat(row['DaysSinceLastAccess']),
      uuid: row['SISId'],
      name: row['Name'],
      email: row['Email'],
    };
  }
}
