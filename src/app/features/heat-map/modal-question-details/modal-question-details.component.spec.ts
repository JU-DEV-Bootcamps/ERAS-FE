import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ModalQuestionDetailsComponent } from './modal-question-details.component';
import { ReportService } from '../../../core/services/report.service.ts.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('ModalQuestionDetailsComponent', () => {
  let component: ModalQuestionDetailsComponent;
  let fixture: ComponentFixture<ModalQuestionDetailsComponent>;
  let reportService: jasmine.SpyObj<ReportService>;

  beforeEach(async () => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getStudentsDetailByVariables',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ModalQuestionDetailsComponent,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { pollUUID: 'test-uuid', data: [] },
        },
        { provide: MatDialogRef, useValue: {} },
        { provide: ReportService, useValue: reportServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalQuestionDetailsComponent);
    component = fixture.componentInstance;
    reportService = TestBed.inject(
      ReportService
    ) as jasmine.SpyObj<ReportService>;
    fixture.detectChanges();
  });

  it('should initialize the form correctly', () => {
    expect(component.filterForm).toBeDefined();
    expect(component.filterForm.get('selectComponent')).toBeDefined();
    expect(component.filterForm.get('selectVariables')).toBeDefined();
    expect(component.filterForm.get('selectNumber')).toBeDefined();
  });

  it('should call getStudentsDetailByVariables and update studentRisk on showStudentList', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      validationErrors: null,
      body: [{ student: 'test-student', answer: { riskLevel: 3 } }],
    };
    reportService.getStudentsDetailByVariables.and.returnValue(
      of(mockResponse)
    );

    component.filterForm.setValue({
      selectComponent: 'test-component',
      selectVariables: { variableId: 1, description: 'test-variable' },
      selectNumber: 10,
    });

    component.loadStudentList();

    expect(reportService.getStudentsDetailByVariables).toHaveBeenCalledWith(
      1,
      'test-uuid',
      10
    );
    expect(component.studentRisk).toEqual(
      jasmine.arrayContaining(mockResponse.body)
    );
  });
});
