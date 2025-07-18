import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ImportStudentsComponent } from './import-students.component';
import { VALIDATION_MESSAGES } from '../../core/constants/messages';
import { of } from 'rxjs';
import { StudentService } from '../../core/services/api/student.service';
import { ActivatedRoute } from '@angular/router';

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
  const mockService = jasmine.createSpyObj('StudentService', ['getData']);

  beforeEach(async () => {
    mockService.getData.and.returnValue(of({ items: [], count: 0 }));
    await TestBed.configureTestingModule({
      imports: [ImportStudentsComponent],
      providers: [
        { provide: StudentService, useValue: mockService },
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

  it('should call validateFile for a valid file within the size limit', () => {
    const validFileContent =
      ';Nombre;Correo electronico;Identificación de SIS del usuario;Cursos inscritos:;Cursos con nota:;Entregas a tiempo en comparación con todas;Puntuación media;Cursos con una nota media por debajo de:;Diferencia de la puntuación pura;Diferencia de la puntuación estandarizada;Días desde el último acceso\n' +
      '1;Nombre de estudiante 1;estudiante1@jala.university;STU-000;1;1;20;91,15;0;6,26;86,27;479\n' +
      '2;Nombre de estudiante 2;estudiante2@jala.university;STU-111;1;1;16;97,63;0;12,74;92,75;396';

    const validFile = new File([validFileContent], 'valid.csv', {
      type: 'text/csv',
    });
    const event = { target: { files: [validFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.fileError).toBeNull(); // Ensure no error is set.
    expect(component.selectedFile).toEqual(validFile); // Ensure the file is selected.
  });
});
