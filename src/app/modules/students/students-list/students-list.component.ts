import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import {
  ListComponent,
  TypeFile,
} from '@shared/components/list/list.component';
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
import {
  getHeadersErrors,
  parseFloatDistinct,
  parseJsonRows,
  parseRowErrors,
} from '@core/utils/helpers/parsers';
import {
  CSV_KEY_TO_MODEL_KEY,
  MandatoryColumns,
  OptionalColumns,
} from '@modules/imports/components/import-preview-students/import-preview-students.model';
import { StudentImport } from '@core/services/interfaces/student.interface';
import { GENERAL_MESSAGES } from '@core/constants/messages';
import { openDialogWithStatus } from '@modules/imports/utils/dialogWithStatus';
import { ExportStateService } from '@core/services/exports/export-state.service';
import { CohortService } from '@core/services/api/cohort.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { mapFields } from '@modules/supports-referrals/utils/fieldMapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Lookup } from '@core/models/lookup';
import {
  NewStudentModalComponent,
  NewStudentModalData,
} from './new-student-modal/new-student-modal.component';

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
  private readonly exportStateService = inject(ExportStateService);
  private readonly cohortService = inject(CohortService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly deleteConfirmation = inject(ModalDeleteConfirmationService);

  @ViewChild('listComponent') listComponent!: ListComponent<StudentModelFlat>;

  dataStudents = new MatTableDataSource<StudentModelFlat>([]);
  students: StudentModelFlat[] = [];
  totalStudents = 0;
  allStudents: StudentModelFlat[] = [];
  pagination: Pagination = {
    pageSize: 10,
    page: 0,
  };
  isLoading = true;
  itemsAreSelectable = true;
  isGenerating = false;
  isExporting = signal<boolean>(false);
  /** Blocks the "New Student" button while the modal data loads (one at a time). */
  isOpeningStudentModal = false;
  private allStudentsLoaded = false;

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
    // Every student has a profile view; those without one start empty, prefilled
    // with the name and email that already exist.
    {
      columnId: 'actions',
      id: 'viewProfile',
      label: 'Profile',
      ngIconName: 'person',
      tooltip: 'View profile',
    },
    {
      columnId: 'actions',
      id: 'deleteStudent',
      label: 'Delete',
      ngIconName: 'delete',
      tooltip: 'Delete student',
      isVisible: (item: unknown) => {
        const student = item as StudentModelFlat;
        return !!student.hasProfile && !student.isImported;
      },
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

  loadAllStudents(): Promise<void> {
    return new Promise(resolve => {
      const batchPageSize = 100;
      let page = 0;
      let allItems: StudentModel[] = [];

      const fetchPage = () => {
        this.studentService
          .getData({
            page,
            pageSize: batchPageSize,
          })
          .subscribe({
            next: response => {
              allItems = [...allItems, ...response.items];
              if (allItems.length < response.count) {
                page++;
                fetchPage();
              } else {
                this.allStudents = this.flattenStudentModel(allItems);
                resolve();
              }
            },
            error: () => resolve(),
          });
      };

      fetchPage();
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
      switch (event.data?.id) {
        case 'viewProfile':
          this.openStudentProfileModal(student);
          break;
        case 'deleteStudent':
          this.confirmDeleteStudent(student);
          break;
        default:
          this.openStudentDetails(student);
      }
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

  openNewStudentModal(): void {
    if (this.isOpeningStudentModal) return;
    this.isOpeningStudentModal = true;

    this.loadCohortLookups().subscribe({
      next: cohorts => {
        this.isOpeningStudentModal = false;
        this.openStudentModal({ cohorts });
      },
      error: err => {
        this.isOpeningStudentModal = false;
        this.showError('Could not open the form', err);
      },
    });
  }

  openStudentProfileModal(student: StudentModelFlat): void {
    if (this.isOpeningStudentModal) return;
    this.isOpeningStudentModal = true;

    this.studentService.getStudentProfile(student.id).subscribe({
      next: profile => {
        this.isOpeningStudentModal = false;
        this.openStudentModal({
          cohorts: [],
          student: profile,
          hasProfile: !!student.hasProfile,
        });
      },
      error: err => {
        this.isOpeningStudentModal = false;
        this.showError('Could not load the student', err);
      },
    });
  }

  confirmDeleteStudent(student: StudentModelFlat): void {
    this.deleteConfirmation
      .confirmDelete({
        title: 'Delete student',
        subtitle: `Are you sure you want to delete ${student.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) this.deleteStudent(student);
      });
  }

  private deleteStudent(student: StudentModelFlat): void {
    this.studentService.deleteStudent(student.id).subscribe({
      next: () => {
        this.toastService.showToast({
          title: 'Student deleted',
          message: `${student.name} has been deleted.`,
          type: 'success',
        });
        this.loadStudents();
      },
      error: (err: HttpErrorResponse) => {
        const detail =
          typeof err.error === 'string' && err.error.trim().length > 0
            ? err.error
            : 'Please try again later.';
        console.error(err);
        this.toastService.showToast(
          {
            title: 'Could not delete the student',
            message: detail,
            type: 'error',
          },
          true
        );
      },
    });
  }

  private openStudentModal(data: NewStudentModalData): void {
    const dialogRef = this.dialog.open(NewStudentModalComponent, {
      autoFocus: false,
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'student-modal-panel',
      data,
    });
    dialogRef.afterClosed().subscribe(saved => {
      if (saved) this.loadStudents();
    });
  }

  private loadCohortLookups(): Observable<Lookup[]> {
    return this.cohortService
      .getCohorts()
      .pipe(map(response => mapFields(response.body, 'name', 'id')));
  }

  private showError(title: string, error: unknown): void {
    console.error(error);
    this.toastService.showToast(
      { title, message: 'Please try again later.', type: 'error' },
      true
    );
  }

  async exportToCSV(): Promise<void> {
    if (this.isGenerating) return;
    this.isGenerating = true;

    try {
      this.listComponent.areExportedAllItems = true;
      await this.listComponent.exportToCSV();
    } finally {
      this.isGenerating = false;
    }
  }

  async onExportRequested(event: TypeFile) {
    void event;
    if (!this.allStudentsLoaded) {
      await this.loadAllStudents();
      this.allStudentsLoaded = true;
    }
  }

  async onExporting(processExport: boolean) {
    this.isExporting.set(processExport);
  }

  async exportToPdf(): Promise<void> {
    if (this.isGenerating) return;
    this.isGenerating = true;

    try {
      this.listComponent.areExportedAllItems = true;
      this.listComponent.exportToPdf();
    } finally {
      this.isGenerating = false;
    }
  }

  private flattenStudentModel(data: StudentModel[]): StudentModelFlat[] {
    return data.map(student => ({
      uuid: student.uuid,
      name: student.name,
      email: student.email,
      isImported: student.isImported,
      hasProfile: student.hasProfile,
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

  openImportModal(restoredFile?: File): void {
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

    if (restoredFile) {
      instance.preloadFile(restoredFile);
    }

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
    const csvErrors = this.csvCheckerService.getErrors();
    if (
      csvErrors.some(e => /Row NaN:|Too few fields|Too many fields/i.test(e))
    ) {
      instance.isLoading = false;
      dialogRef.close();

      const previewRef = this.prepareDialog();
      const preview = previewRef.componentInstance;
      const errorsInHeaders = getHeadersErrors(csvErrors);
      preview.rows = [];
      preview.errorsInHeaders =
        errorsInHeaders.length > 0 ? errorsInHeaders : csvErrors;
      preview.columns = [...MandatoryColumns];
      preview.dialogRef = previewRef;
      preview.cancelled.subscribe(() => this.openImportModal(file));
      preview.cancelledExit.subscribe(() => {
        preview.dialogRef?.close();
        dialogRef.close();
      });
      return;
    }

    const rawRows: Record<string, string>[] =
      this.csvCheckerService.getCSVData();
    const rowErrorMap = parseRowErrors(csvErrors);
    const errorsInHeaders = getHeadersErrors(csvErrors);

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

    const previewRef = this.prepareDialog();
    const preview = previewRef.componentInstance;
    preview.title = 'Import Students';
    preview.rows = previewRows;
    preview.errorsInHeaders = errorsInHeaders;
    preview.columns = [...MandatoryColumns, ...detectedOptionalColumns];
    preview.dialogRef = previewRef;
    preview.cancelled.subscribe(() => this.openImportModal(file));
    preview.cancelledExit.subscribe(() => {
      preview.dialogRef?.close();
      dialogRef.close();
    });

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
        if (error.status === 500) {
          openDialogWithStatus(
            GENERAL_MESSAGES.ERROR_500,
            false,
            [],
            fileErrors,
            this.dialog
          );
        } else if (error.status === 400) {
          const keys = Object.keys(error.error.errors);
          const errors = keys.slice(1).map(key => {
            const attribute: string = key.split('.').pop() ?? '';
            return GENERAL_MESSAGES.INVALID_TYPE_ERROR_400(attribute);
          });
          openDialogWithStatus(
            GENERAL_MESSAGES.ERROR_400,
            false,
            errors,
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
      avgScore: parseFloatDistinct(row['AverageScore']),
      coursesUnderAvg: parseFloat(row['CoursesBelowAverage']),
      pureScoreDiff: parseFloat(row['RawScoreDifference']),
      standardScoreDiff: parseFloat(row['StandardScoreDifference']),
      lastAccessDays: parseFloat(row['DaysSinceLastAccess']),
      uuid: row['SISId'],
      name: row['Name'],
      email: row['Email'],
    };
  }

  private prepareDialog(): MatDialogRef<ImportPreviewStudentsComponent> {
    return this.dialog.open(ImportPreviewStudentsComponent, {
      maxWidth: '80vw',
      maxHeight: '90vh',
      panelClass: 'import-preview-students-dialog',
    });
  }
}
