import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ImportStudentsComponent } from './import-students.component';
import {
  GENERAL_MESSAGES,
  VALIDATION_MESSAGES,
} from '@core/constants/messages';
import { of, throwError } from 'rxjs';
import { StudentService } from '@core/services/api/student.service';
import { CsvCheckerService } from '@core/services/csv-checker.service';
import { ActivatedRoute } from '@angular/router';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';
import { ServerResponse } from '@core/services/interfaces/server.type';

describe('ImportStudentsComponent', () => {
  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
    params: of({}),
    queryParams: of({}),
  };

  let component: ImportStudentsComponent;
  let fixture: ComponentFixture<ImportStudentsComponent>;
  const mockService = jasmine.createSpyObj('StudentService', [
    'getData',
    'postData',
  ]);
  const mockCsvCheckerService = jasmine.createSpyObj('CsvCheckerService', [
    'validateCSV',
    'getSummarizedErrors',
    'getCSVData',
    'getErrors',
  ]);

  beforeEach(async () => {
    mockService.getData.calls.reset();
    mockService.postData.calls.reset();
    mockCsvCheckerService.validateCSV.calls.reset();
    mockCsvCheckerService.getSummarizedErrors.calls.reset();
    mockCsvCheckerService.getCSVData.calls.reset();
    mockCsvCheckerService.getErrors.calls.reset();

    mockService.getData.and.returnValue(of({ items: [], count: 0 }));
    mockService.postData.and.returnValue(
      of({ status: 200, message: 'ok' } as ServerResponse)
    );
    mockCsvCheckerService.validateCSV.and.returnValue(Promise.resolve());
    mockCsvCheckerService.getSummarizedErrors.and.returnValue([]);
    mockCsvCheckerService.getCSVData.and.returnValue([]);
    mockCsvCheckerService.getErrors.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [ImportStudentsComponent],
      providers: [
        { provide: StudentService, useValue: mockService },
        { provide: CsvCheckerService, useValue: mockCsvCheckerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set fileError and not call validateFile if file size exceeds 5MB', () => {
    const largeFileContent = 'a'.repeat(5 * 1024 * 1024 + 1);
    const largeFile = new File([largeFileContent], 'large.csv', {
      type: 'text/csv',
    });
    const event = { target: { files: [largeFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.fileError).toBe(
      VALIDATION_MESSAGES.FILE_SIZE_EXCEEDED + '(5MB)'
    );
    expect(component.selectedFile).toBeNull();
  });

  it('should set fileError and not call validateFile if file type is not CSV', () => {
    const invalidFile = new File(['content'], 'test.txt', {
      type: 'text/plain',
    });
    const event = { target: { files: [invalidFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.fileError).toBe(
      VALIDATION_MESSAGES.INVALID_FILE_TYPE + '(.csv)'
    );
    expect(component.selectedFile).toBeNull();
  });

  it('should call validateFile for a valid file within the size limit', async () => {
    const validFileContent =
      ';Nombre;Correo electronico;Identificación de SIS del usuario;Cursos inscritos:;Cursos con nota:;Entregas a tiempo en comparación con todas;Puntuación media;Cursos con una nota media por debajo de:;Diferencia de la puntuación pura;Diferencia de la puntuación estandarizada;Días desde el último acceso\n' +
      '1;Nombre de estudiante 1;estudiante1@jala.university;STU-000;1;1;20;91,15;0;6,26;86,27;479\n' +
      '2;Nombre de estudiante 2;estudiante2@jala.university;STU-111;1;1;16;97,63;0;12,74;92,75;396';

    const validFile = new File([validFileContent], 'valid.csv', {
      type: 'text/csv',
    });
    const event = { target: { files: [validFile] } } as unknown as Event;

    spyOn(component, 'openDialog');

    component.onFileSelected(event);

    expect(component.fileError).toBeNull();
    expect(component.selectedFile).toEqual(validFile);

    await fixture.whenStable();
  });

  describe('onFileSelected (no file)', () => {
    it('should do nothing when no file is provided', () => {
      const event = { target: { files: [] } } as unknown as Event;

      component.onFileSelected(event);

      expect(component.selectedFile).toBeNull();
    });
  });

  describe('importOtherFIle', () => {
    it('should trigger a click on the hidden file input', () => {
      const clickSpy = spyOn(component.inputFile.nativeElement, 'click');

      component.importOtherFIle();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('validateFile (private)', () => {
    const csvFile = new File(['data'], 'valid.csv', { type: 'text/csv' });

    it('should call importFile when the CSV has no validation errors', async () => {
      mockCsvCheckerService.getSummarizedErrors.and.returnValue([]);
      spyOn(component, 'importFile');
      component.selectedFile = csvFile;

      await component['validateFile'](csvFile);

      expect(component.fileError).toBeNull();
      expect(component.importFile).toHaveBeenCalled();
    });

    it('should reject the file when the CSV has validation errors', async () => {
      mockCsvCheckerService.getSummarizedErrors.and.returnValue([
        'Row 1 has 1 validation errors.',
      ]);
      spyOn(component, 'openDialog');
      component.selectedFile = csvFile;

      await component['validateFile'](csvFile);

      expect(component.fileError).toBe(VALIDATION_MESSAGES.CSV_SCAN_ERROR);
      expect(component.selectedFile).toBeNull();
      expect(component.csvErrors).toEqual(['Row 1 has 1 validation errors.']);
      expect(component.openDialog).toHaveBeenCalledWith(
        GENERAL_MESSAGES.DETAILS,
        false
      );
    });

    it('should reject the file when CSV parsing throws', async () => {
      mockCsvCheckerService.validateCSV.and.returnValue(
        Promise.reject(new Error('parse boom'))
      );
      spyOn(component, 'openDialog');
      spyOn(console, 'error');
      component.selectedFile = csvFile;

      await component['validateFile'](csvFile);

      expect(component.fileError).toBe(VALIDATION_MESSAGES.CSV_SCAN_ERROR);
      expect(component.selectedFile).toBeNull();
      expect(component.openDialog).toHaveBeenCalledWith(
        GENERAL_MESSAGES.DETAILS,
        false
      );
    });
  });

  describe('importFile', () => {
    const csvFile = new File(['data'], 'valid.csv', { type: 'text/csv' });

    it('should map CSV rows, replace decimal commas, drop unknown keys, and notify success', () => {
      mockCsvCheckerService.getCSVData.and.returnValue([
        {
          Name: 'John Doe',
          Email: 'john@test.com',
          SISId: 'STU-1',
          EnrolledCourses: '1',
          GradedCourses: '1',
          TimelySubmissions: '20',
          AverageScore: '91,15',
          CoursesBelowAverage: '0',
          RawScoreDifference: '6,26',
          StandardScoreDifference: '86,27',
          DaysSinceLastAccess: '479',
          ExtraColumn: 'ignore-me',
        },
      ]);
      mockService.postData.and.returnValue(
        of({ status: 200, message: 'Import successful' } as ServerResponse)
      );
      spyOn(component, 'openDialog');
      spyOn(component.listImportedStudentComponent, 'loadStudents');
      component.selectedFile = csvFile;

      component.importFile();

      expect(mockService.postData).toHaveBeenCalledWith([
        {
          Name: 'John Doe',
          Email: 'john@test.com',
          SISId: 'STU-1',
          EnrolledCourses: '1',
          GradedCourses: '1',
          TimelySubmissions: '20',
          AverageScore: '91.15',
          CoursesBelowAverage: '0',
          RawScoreDifference: '6.26',
          StandardScoreDifference: '86.27',
          DaysSinceLastAccess: '479',
        },
      ]);
      expect(component.isLoading).toBeFalse();
      expect(component.openDialog).toHaveBeenCalledWith(
        'Import successful',
        true
      );
      expect(
        component.listImportedStudentComponent.loadStudents
      ).toHaveBeenCalled();
    });

    it('should set isLoading true while the request is pending', () => {
      mockCsvCheckerService.getCSVData.and.returnValue([]);
      mockService.postData.and.returnValue(
        of({ status: 200, message: 'ok' } as ServerResponse)
      );
      let loadingDuringCall = false;
      mockService.postData.and.callFake(() => {
        loadingDuringCall = component.isLoading;
        return of({ status: 200, message: 'ok' } as ServerResponse);
      });
      component.selectedFile = csvFile;

      component.importFile();

      expect(loadingDuringCall).toBeTrue();
    });

    it('should report a 500 error through openDialog', () => {
      mockCsvCheckerService.getCSVData.and.returnValue([]);
      mockService.postData.and.returnValue(
        throwError(() => ({ status: 500, message: 'Internal error' }))
      );
      spyOn(component, 'openDialog');
      component.selectedFile = csvFile;

      component.importFile();

      expect(component.isLoading).toBeFalse();
      expect(component.openDialog).toHaveBeenCalledWith(
        GENERAL_MESSAGES.ERROR_500,
        false
      );
    });

    it('should report an unknown error through openDialog', () => {
      mockCsvCheckerService.getCSVData.and.returnValue([]);
      mockService.postData.and.returnValue(
        throwError(() => ({ status: 400, message: 'Bad request' }))
      );
      spyOn(component, 'openDialog');
      component.selectedFile = csvFile;

      component.importFile();

      expect(component.isLoading).toBeFalse();
      expect(component.openDialog).toHaveBeenCalledWith(
        GENERAL_MESSAGES.ERROR_UNKNOWN + 'Bad request',
        false
      );
    });

    it('should do nothing when there is no selected file', () => {
      component.selectedFile = null;

      component.importFile();

      expect(mockService.postData).not.toHaveBeenCalled();
    });
  });

  describe('openDialog', () => {
    it('should open a success dialog with the given text', () => {
      const dialogSpy = spyOn(component.dialog, 'open');

      component.openDialog('All good', true);

      expect(dialogSpy).toHaveBeenCalledWith(
        ModalComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            isSuccess: true,
            type: 'success',
            title: GENERAL_MESSAGES.SUCCESS_IMPORT_TITLE,
            message: 'All good',
            details: 'All good',
          }),
        })
      );
    });

    it('should open an error dialog using fileError as the message', () => {
      const dialogSpy = spyOn(component.dialog, 'open');
      component.fileError = 'Something failed';
      component.csvErrors = [];

      component.openDialog('ignored text', false);

      expect(dialogSpy).toHaveBeenCalledWith(
        ModalComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            isSuccess: false,
            type: 'error',
            title: GENERAL_MESSAGES.ERROR_IMPORT_TITLE,
            message: 'Something failed',
            details: [GENERAL_MESSAGES.ERROR_500],
          }),
        })
      );
    });
  });

  describe('openDetailsDialog (private)', () => {
    it('should populate csvErrors from the service and open the error modal', () => {
      mockCsvCheckerService.getErrors.and.returnValue([
        'Missing headers: Email',
      ]);
      const dialogSpy = spyOn(component.dialog, 'open');
      component.fileError = 'Following errors detected';

      component['openDetailsDialog']();

      expect(component.csvErrors).toEqual(['Missing headers: Email']);
      expect(dialogSpy).toHaveBeenCalledWith(
        ModalComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            type: 'error',
            title: GENERAL_MESSAGES.ERROR_IMPORT_TITLE,
            message: 'Following errors detected',
            details: ['Missing headers: Email'],
          }),
        })
      );
    });
  });
});
