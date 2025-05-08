import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { StudentModel } from '../../../core/models/student.model';
import { EditObjectModalComponent } from './modal-edit-object.component';
import { StudentDetailModel } from '../../../core/models/student-detail.model';

describe('EditObjectModalComponent', () => {
  let component: EditObjectModalComponent<StudentModel>;
  let fixture: ComponentFixture<EditObjectModalComponent<StudentModel>>;
  let dialogRefSpy: jasmine.SpyObj<
    MatDialogRef<EditObjectModalComponent<StudentModel>>
  >;

  const mocktSudentDetail: StudentDetailModel = {
    studentId: 2,
    enrolledCourses: 5,
    gradedCourses: 3,
    timeDeliveryRate: 23,
    avgScore: 3,
    coursesUnderAvg: 5,
    pureScoreDiff: 1,
    standardScoreDiff: 7,
    lastAccessDays: 3,
    id: 25,
  };
  const mockStudentModel: StudentModel = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    uuid: 'iduflakjng-3456-243526',
    isImported: false,
    studentDetail: mocktSudentDetail,
    cohortId: 1,
    id: 3,
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockStudentModel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditObjectModalComponent<StudentModel>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render a form with inputs for each key in the StudentModel', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input[matInput]'));
    expect(inputs.length).toBe(Object.keys(mockStudentModel).length);

    inputs.forEach((input, index) => {
      const key = Object.keys(mockStudentModel)[index] as keyof StudentModel;
      expect(input.nativeElement.value).toBe(mockStudentModel[key]!.toString());
    });
  });

  it('should call dialogRef.close() with no arguments when Cancel is clicked', () => {
    const cancelButton = fixture.debugElement.query(
      By.css('button[mat-button]')
    );
    cancelButton.nativeElement.click();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should disable input fields for read-only keys', () => {
    spyOn(component, 'isReadOnly').and.returnValue(true);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input[matInput]'));
    inputs.forEach(input => {
      expect(input.nativeElement.readOnly).toBeTrue();
    });
  });
});
