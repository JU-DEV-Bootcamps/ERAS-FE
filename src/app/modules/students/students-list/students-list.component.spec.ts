import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentsListComponent } from './students-list.component';
import { HttpClientModule } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import Keycloak from 'keycloak-js';
import { EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StudentService } from '@core/services/api/student.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { CsvCheckerService } from '@core/services/csv-checker.service';
import { EventAction, EventLoad } from '@core/models/load';
import { StudentModel, StudentModelFlat } from '@core/models/student.model';
import { ServerResponse } from '@core/services/interfaces/server.type';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { ImportModalComponent } from '@modules/imports/components/import-modal/import-modal.component';
import { ImportPreviewStudentsComponent } from '@modules/imports/components/import-preview-students/import-preview-students.component';
import { MandatoryColumns } from '@modules/imports/components/import-preview-students/import-preview-students.model';
import { StudentImport } from '@core/services/interfaces/student.interface';
import { StudentModelPreview } from '@shared/components/list/types/preview';

const mockActivatedRoute = {
  snapshot: { paramMap: { get: () => null } },
  params: of({}),
  queryParams: of({}),
};

const buildStudent = (overrides: Partial<StudentModel> = {}): StudentModel =>
  ({
    id: 1,
    uuid: 'uuid-1',
    name: 'Ana Perez',
    email: 'ana@test.com',
    isImported: true,
    cohortId: 1,
    cohort: 'Cohort A',
    isSelected: false,
    audit: {},
    studentDetail: {
      studentId: 100,
      enrolledCourses: 5,
      gradedCourses: 4,
      timeDeliveryRate: 0.8,
      avgScore: 90,
      coursesUnderAvg: 1,
      pureScoreDiff: 2,
      standardScoreDiff: 0.5,
      lastAccessDays: 3,
    },
    ...overrides,
  }) as StudentModel;

interface ListLike {
  exportToCSV(): Promise<void>;
  exportToPdf(): Promise<void>;
}

interface StudentsListComponentPrivate {
  list: () => ListLike | undefined;
  handlePreviewImport(
    file: File,
    instance: ImportModalComponent,
    dialogRef: MatDialogRef<ImportModalComponent>
  ): Promise<void>;
  submitImport(
    rows: StudentModelFlat[],
    json: StudentImport[],
    preview: ImportPreviewStudentsComponent,
    previewRef: MatDialogRef<ImportPreviewStudentsComponent>
  ): void;
  convertToModel(row: Record<string, string>): StudentModelPreview;
  flattenStudentModel(data: StudentModel[]): StudentModelFlat[];
  prepareDialog(): MatDialogRef<ImportPreviewStudentsComponent>;
}

const asPrivate = (cmp: StudentsListComponent): StudentsListComponentPrivate =>
  cmp as unknown as StudentsListComponentPrivate;

describe('StudentsListComponent', () => {
  let component: StudentsListComponent;
  let fixture: ComponentFixture<StudentsListComponent>;

  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let featureFlagsSpy: jasmine.SpyObj<FeatureFlagsService>;
  let csvCheckerSpy: jasmine.SpyObj<CsvCheckerService>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({
      componentInstance: {},
      close: jasmine.createSpy('close'),
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<unknown>);

    studentServiceSpy = jasmine.createSpyObj<StudentService>('StudentService', [
      'getData',
      'postData',
    ]);
    studentServiceSpy.getData.and.returnValue(
      of({ items: [buildStudent()], count: 1 })
    );

    featureFlagsSpy = jasmine.createSpyObj<FeatureFlagsService>(
      'FeatureFlagsService',
      ['isEnabled']
    );
    featureFlagsSpy.isEnabled.and.returnValue(false);

    csvCheckerSpy = jasmine.createSpyObj<CsvCheckerService>(
      'CsvCheckerService',
      ['validateCSV', 'getErrors', 'getCSVData']
    );
    csvCheckerSpy.validateCSV.and.returnValue(Promise.resolve());
    csvCheckerSpy.getErrors.and.returnValue([]);
    csvCheckerSpy.getCSVData.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [StudentsListComponent, HttpClientModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Keycloak, useValue: {} },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: FeatureFlagsService, useValue: featureFlagsSpy },
        { provide: CsvCheckerService, useValue: csvCheckerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadStudents', () => {
    it('should populate students, dataStudents and totalStudents on success', () => {
      expect(component.students.length).toBe(1);
      expect(component.dataStudents.data.length).toBe(1);
      expect(component.totalStudents).toBe(1);
      expect(component.isLoading).toBeFalse();
    });

    it('should preserve isSelected for students already present in the list', () => {
      component.students = [
        {
          ...component.students[0],
          isSelected: true,
        },
      ];

      component.loadStudents();

      expect(component.students[0].isSelected).toBeTrue();
    });

    it('should default isSelected to false for students not previously present', () => {
      component.students = [];
      component.loadStudents();

      expect(component.students[0].isSelected).toBeFalse();
    });

    it('should handle errors while loading students', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      studentServiceSpy.getData.and.returnValue(
        throwError(() => new Error('network error'))
      );

      component.loadStudents();

      expect(component.isLoading).toBeFalse();
      expect(consoleErrorSpy).toHaveBeenCalledWith(jasmine.any(Error));
    });
  });

  describe('handleLoadCalled', () => {
    it('should update pagination and reload students', () => {
      const loadSpy = spyOn(component, 'loadStudents');
      const event: EventLoad = { page: 2, pageSize: 25 };

      component.handleLoadCalled(event);

      expect(component.pagination).toEqual({ page: 2, pageSize: 25 });
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update pagination and reload students', () => {
      const loadSpy = spyOn(component, 'loadStudents');

      component.onPageChange({
        pageIndex: 3,
        pageSize: 50,
        length: 100,
      });

      expect(component.pagination).toEqual({ page: 3, pageSize: 50 });
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('handleActionCalled', () => {
    it('should open student details when the student is found', () => {
      const detailsSpy = spyOn(component, 'openStudentDetails');
      const event = {
        item: { id: component.students[0].id },
      } as unknown as EventAction;

      component.handleActionCalled(event);

      expect(detailsSpy).toHaveBeenCalledWith(component.students[0]);
    });

    it('should warn when the student is not found', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      const event = { item: { id: 'non-existent' } } as unknown as EventAction;

      component.handleActionCalled(event);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Student not found on array.'
      );
    });
  });

  describe('openStudentDetails', () => {
    it('should open the V1 modal when the feature flag is disabled', () => {
      featureFlagsSpy.isEnabled.and.returnValue(false);

      component.openStudentDetails(component.students[0]);

      expect(featureFlagsSpy.isEnabled).toHaveBeenCalledWith(
        FEATURE_FLAGS.studentDetails
      );
      expect(dialogSpy.open).toHaveBeenCalledWith(
        ModalStudentDetailComponent,
        jasmine.objectContaining({
          data: { studentId: component.students[0].id },
        })
      );
    });

    it('should open the V2 modal when the feature flag is enabled', () => {
      featureFlagsSpy.isEnabled.and.returnValue(true);

      component.openStudentDetails(component.students[0]);

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ModalStudentDetailV2Component,
        jasmine.objectContaining({
          data: { studentId: component.students[0].id },
        })
      );
    });
  });

  describe('exportToCSV', () => {
    it('should call the list export, toggling isGenerating', async () => {
      const listSpy = jasmine.createSpyObj<ListLike>('ListComponent', [
        'exportToCSV',
        'exportToPdf',
      ]);
      listSpy.exportToCSV.and.returnValue(Promise.resolve());
      asPrivate(component).list = () => listSpy;

      const promise = component.exportToCSV();
      expect(component.isGenerating).toBeTrue();

      await promise;

      expect(listSpy.exportToCSV).toHaveBeenCalled();
      expect(component.isGenerating).toBeFalse();
    });

    it('should reset isGenerating even when the export throws', async () => {
      const listSpy = jasmine.createSpyObj<ListLike>('ListComponent', [
        'exportToCSV',
        'exportToPdf',
      ]);
      listSpy.exportToCSV.and.returnValue(Promise.reject(new Error('fail')));
      asPrivate(component).list = () => listSpy;

      await expectAsync(component.exportToCSV()).toBeRejected();

      expect(component.isGenerating).toBeFalse();
    });

    it('should not start a new export while one is already in progress', async () => {
      const listSpy = jasmine.createSpyObj<ListLike>('ListComponent', [
        'exportToCSV',
        'exportToPdf',
      ]);
      listSpy.exportToCSV.and.returnValue(Promise.resolve());
      asPrivate(component).list = () => listSpy;
      component.isGenerating = true;

      await component.exportToCSV();

      expect(listSpy.exportToCSV).not.toHaveBeenCalled();
    });
  });

  describe('exportToPdf', () => {
    it('should call the list PDF export, toggling isGenerating', async () => {
      const listSpy = jasmine.createSpyObj<ListLike>('ListComponent', [
        'exportToCSV',
        'exportToPdf',
      ]);
      listSpy.exportToPdf.and.returnValue(Promise.resolve());
      asPrivate(component).list = () => listSpy;

      await component.exportToPdf();

      expect(listSpy.exportToPdf).toHaveBeenCalled();
      expect(component.isGenerating).toBeFalse();
    });

    it('should not start a new PDF export while one is already in progress', async () => {
      const listSpy = jasmine.createSpyObj<ListLike>('ListComponent', [
        'exportToCSV',
        'exportToPdf',
      ]);
      listSpy.exportToPdf.and.returnValue(Promise.resolve());
      asPrivate(component).list = () => listSpy;
      component.isGenerating = true;

      await component.exportToPdf();

      expect(listSpy.exportToPdf).not.toHaveBeenCalled();
    });
  });

  describe('openImportModal', () => {
    let importModalInstance: {
      config: unknown;
      dialogRef: unknown;
      isLoading: boolean;
      fileSelected: EventEmitter<File>;
      preloadFile: jasmine.Spy;
    };
    let importModalRef: {
      componentInstance: typeof importModalInstance;
      close: jasmine.Spy;
    };

    beforeEach(() => {
      importModalInstance = {
        config: undefined,
        dialogRef: undefined,
        isLoading: false,
        fileSelected: new EventEmitter<File>(),
        preloadFile: jasmine.createSpy('preloadFile'),
      };
      importModalRef = {
        componentInstance: importModalInstance,
        close: jasmine.createSpy('close'),
      };
      dialogSpy.open.and.returnValue(
        importModalRef as unknown as MatDialogRef<unknown>
      );
    });

    it('should open the import modal without preloading a file', () => {
      component.openImportModal();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ImportModalComponent,
        jasmine.objectContaining({ panelClass: 'import-modal-dialog' })
      );
      expect(importModalInstance.preloadFile).not.toHaveBeenCalled();
    });

    it('should preload the restored file when provided', () => {
      const file = new File(['content'], 'students.csv');

      component.openImportModal(file);

      expect(importModalInstance.preloadFile).toHaveBeenCalledWith(file);
    });

    it('should mark the modal as loading and trigger preview handling on file selection', () => {
      const handlePreviewSpy = spyOn(
        asPrivate(component),
        'handlePreviewImport'
      ).and.returnValue(Promise.resolve());
      const file = new File(['content'], 'students.csv');

      component.openImportModal();
      importModalInstance.fileSelected.emit(file);

      expect(importModalInstance.isLoading).toBeTrue();
      expect(handlePreviewSpy).toHaveBeenCalledWith(
        file,
        importModalInstance as unknown as ImportModalComponent,
        importModalRef as unknown as MatDialogRef<ImportModalComponent>
      );
    });
  });

  describe('handlePreviewImport (private)', () => {
    let importModalInstance: { isLoading: boolean };
    let importModalRef: { close: jasmine.Spy };
    let previewInstance: {
      title?: string;
      rows: unknown[];
      errorsInHeaders: string[];
      columns: unknown[];
      dialogRef: unknown;
      isLoading: boolean;
      cancelled: EventEmitter<void>;
      cancelledExit: EventEmitter<void>;
      confirmed: EventEmitter<{ rows: StudentModelFlat[] }>;
    };
    let previewRef: {
      componentInstance: typeof previewInstance;
      close: jasmine.Spy;
    };
    const file = new File(['content'], 'students.csv');

    beforeEach(() => {
      importModalInstance = { isLoading: true };
      importModalRef = { close: jasmine.createSpy('close') };

      previewInstance = {
        title: undefined,
        rows: [],
        errorsInHeaders: [],
        columns: [],
        dialogRef: undefined,
        isLoading: false,
        cancelled: new EventEmitter<void>(),
        cancelledExit: new EventEmitter<void>(),
        confirmed: new EventEmitter<{ rows: StudentModelFlat[] }>(),
      };
      previewRef = {
        componentInstance: previewInstance,
        close: jasmine.createSpy('close'),
      };

      dialogSpy.open.and.returnValue(
        previewRef as unknown as MatDialogRef<unknown>
      );
    });

    it('should stop loading and not open a preview when CSV validation fails', async () => {
      csvCheckerSpy.validateCSV.and.returnValue(Promise.reject('invalid'));

      await asPrivate(component).handlePreviewImport(
        file,
        importModalInstance as unknown as ImportModalComponent,
        importModalRef as unknown as MatDialogRef<ImportModalComponent>
      );

      expect(importModalInstance.isLoading).toBeFalse();
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should open a header-only preview when structural CSV errors are found', async () => {
      csvCheckerSpy.getErrors.and.returnValue(['Row NaN: malformed row']);

      await asPrivate(component).handlePreviewImport(
        file,
        importModalInstance as unknown as ImportModalComponent,
        importModalRef as unknown as MatDialogRef<ImportModalComponent>
      );

      expect(importModalInstance.isLoading).toBeFalse();
      expect(importModalRef.close).toHaveBeenCalled();
      expect(dialogSpy.open).toHaveBeenCalledWith(
        ImportPreviewStudentsComponent,
        jasmine.objectContaining({
          panelClass: 'import-preview-students-dialog',
        })
      );
      expect(previewInstance.rows).toEqual([]);
      expect(previewInstance.columns).toEqual([...MandatoryColumns]);
    });

    it('should reopen the import modal when the header-only preview is cancelled', async () => {
      csvCheckerSpy.getErrors.and.returnValue(['Too few fields on row 2']);
      dialogSpy.open.calls.reset();

      await asPrivate(component).handlePreviewImport(
        file,
        importModalInstance as unknown as ImportModalComponent,
        importModalRef as unknown as MatDialogRef<ImportModalComponent>
      );
      dialogSpy.open.calls.reset();

      const reopenedInstance = {
        config: undefined,
        dialogRef: undefined,
        isLoading: false,
        fileSelected: new EventEmitter<File>(),
        preloadFile: jasmine.createSpy('preloadFile'),
      };
      dialogSpy.open.and.returnValue({
        componentInstance: reopenedInstance,
        close: jasmine.createSpy('close'),
      } as unknown as MatDialogRef<unknown>);

      previewInstance.cancelled.emit();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ImportModalComponent,
        jasmine.any(Object)
      );
      expect(reopenedInstance.preloadFile).toHaveBeenCalledWith(file);
    });

    it('should close both dialogs when the header-only preview is exited', async () => {
      csvCheckerSpy.getErrors.and.returnValue(['Too many fields on row 3']);

      await asPrivate(component).handlePreviewImport(
        file,
        importModalInstance as unknown as ImportModalComponent,
        importModalRef as unknown as MatDialogRef<ImportModalComponent>
      );

      previewInstance.cancelledExit.emit();

      expect(previewRef.close).toHaveBeenCalled();
      expect(importModalRef.close).toHaveBeenCalled();
    });

    it('should build a full row preview when there are no structural CSV errors', async () => {
      csvCheckerSpy.getErrors.and.returnValue([]);
      csvCheckerSpy.getCSVData.and.returnValue([
        {
          SISId: 'uuid-9',
          Name: 'Carlos Ruiz',
          Email: 'carlos@test.com',
          Id: '9',
          EnrolledCourses: '3',
          GradedCourses: '2',
          TimelySubmissions: '0.6',
          AverageScore: '75',
          CoursesBelowAverage: '1',
          RawScoreDifference: '1',
          StandardScoreDifference: '0.1',
          DaysSinceLastAccess: '2',
        },
      ]);

      await asPrivate(component).handlePreviewImport(
        file,
        importModalInstance as unknown as ImportModalComponent,
        importModalRef as unknown as MatDialogRef<ImportModalComponent>
      );

      expect(importModalInstance.isLoading).toBeFalse();
      expect(importModalRef.close).toHaveBeenCalled();
      expect(previewInstance.title).toBe('Import Students');
      expect(previewInstance.rows.length).toBe(1);
      expect(previewInstance.columns.length).toBeGreaterThanOrEqual(
        MandatoryColumns.length
      );
    });

    it('should call submitImport when the full preview is confirmed', async () => {
      csvCheckerSpy.getErrors.and.returnValue([]);
      csvCheckerSpy.getCSVData.and.returnValue([]);
      const submitImportSpy = spyOn(asPrivate(component), 'submitImport');

      await asPrivate(component).handlePreviewImport(
        file,
        importModalInstance as unknown as ImportModalComponent,
        importModalRef as unknown as MatDialogRef<ImportModalComponent>
      );

      const confirmResult: { rows: StudentModelFlat[] } = { rows: [] };
      previewInstance.confirmed.emit(confirmResult);

      expect(previewInstance.isLoading).toBeTrue();
      expect(submitImportSpy).toHaveBeenCalledWith(
        confirmResult.rows,
        [],
        previewInstance as unknown as ImportPreviewStudentsComponent,
        previewRef as unknown as MatDialogRef<ImportPreviewStudentsComponent>
      );
    });
  });

  describe('submitImport (private)', () => {
    const rows: StudentModelFlat[] = [{ uuid: 'uuid-9' } as StudentModelFlat];
    const json: StudentImport[] = [
      { SISId: 'uuid-9' } as unknown as StudentImport,
    ];
    let previewInstance: { isLoading: boolean };
    let previewRef: { close: jasmine.Spy };

    beforeEach(() => {
      previewInstance = { isLoading: true };
      previewRef = { close: jasmine.createSpy('close') };
    });

    it('should reload the students list and close the preview on success', () => {
      const loadSpy = spyOn(component, 'loadStudents');
      studentServiceSpy.postData.and.returnValue(
        of({ message: 'Imported successfully' } as unknown as ServerResponse)
      );

      asPrivate(component).submitImport(
        rows,
        json,
        previewInstance as unknown as ImportPreviewStudentsComponent,
        previewRef as unknown as MatDialogRef<ImportPreviewStudentsComponent>
      );

      expect(component.isLoading).toBeFalse();
      expect(previewRef.close).toHaveBeenCalled();
      expect(dialogSpy.open).toHaveBeenCalled();
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should show the generic 500 error message', () => {
      studentServiceSpy.postData.and.returnValue(
        throwError(() => ({ status: 500 }))
      );

      asPrivate(component).submitImport(
        rows,
        json,
        previewInstance as unknown as ImportPreviewStudentsComponent,
        previewRef as unknown as MatDialogRef<ImportPreviewStudentsComponent>
      );

      expect(component.isLoading).toBeFalse();
      expect(previewRef.close).toHaveBeenCalled();
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should build field-level messages for a 400 validation error', () => {
      studentServiceSpy.postData.and.returnValue(
        throwError(() => ({
          status: 400,
          error: {
            errors: {
              title: [],
              'Model.Email': [],
              'Model.Name': [],
            },
          },
        }))
      );

      asPrivate(component).submitImport(
        rows,
        json,
        previewInstance as unknown as ImportPreviewStudentsComponent,
        previewRef as unknown as MatDialogRef<ImportPreviewStudentsComponent>
      );

      expect(component.isLoading).toBeFalse();
      expect(previewRef.close).toHaveBeenCalled();
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should fall back to an unknown-error message for any other status', () => {
      studentServiceSpy.postData.and.returnValue(
        throwError(() => ({ status: 418, message: 'teapot' }))
      );

      asPrivate(component).submitImport(
        rows,
        json,
        previewInstance as unknown as ImportPreviewStudentsComponent,
        previewRef as unknown as MatDialogRef<ImportPreviewStudentsComponent>
      );

      expect(component.isLoading).toBeFalse();
      expect(previewRef.close).toHaveBeenCalled();
      expect(dialogSpy.open).toHaveBeenCalled();
    });
  });

  describe('convertToModel (private)', () => {
    it('should parse a raw CSV row into a StudentModelPreview', () => {
      const row = {
        Id: '42',
        EnrolledCourses: '6',
        GradedCourses: '5',
        TimelySubmissions: '0.9',
        AverageScore: '88',
        CoursesBelowAverage: '1',
        RawScoreDifference: '2',
        StandardScoreDifference: '0.3',
        DaysSinceLastAccess: '4',
        SISId: 'uuid-42',
        Name: 'Luis Vega',
        Email: 'luis@test.com',
      };

      const result = asPrivate(component).convertToModel(row);

      expect(result).toEqual(
        jasmine.objectContaining({
          studentId: 42,
          enrolledCourses: 6,
          gradedCourses: 5,
          uuid: 'uuid-42',
          name: 'Luis Vega',
          email: 'luis@test.com',
        })
      );
    });
  });

  describe('flattenStudentModel (private)', () => {
    it('should map nested studentDetail fields to a flat structure', () => {
      const student = buildStudent({ id: 7 });

      const result = asPrivate(component).flattenStudentModel([student]);

      expect(result[0]).toEqual(
        jasmine.objectContaining({
          id: 7,
          studentId: student.studentDetail.studentId,
          avgScore: student.studentDetail.avgScore,
        })
      );
    });
  });

  describe('prepareDialog (private)', () => {
    it('should open the ImportPreviewStudentsComponent dialog', () => {
      asPrivate(component).prepareDialog();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ImportPreviewStudentsComponent,
        jasmine.objectContaining({
          panelClass: 'import-preview-students-dialog',
        })
      );
    });
  });
});
