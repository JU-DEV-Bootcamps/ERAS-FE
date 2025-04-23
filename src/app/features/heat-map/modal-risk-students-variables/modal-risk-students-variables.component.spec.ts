import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ModalRiskStudentsVariablesComponent } from './modal-risk-students-variables.component';
import { ReportService } from '../../../core/services/report.service.ts.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('ModalRiskStudentsVariablesComponent', () => {
  let component: ModalRiskStudentsVariablesComponent;
  let fixture: ComponentFixture<ModalRiskStudentsVariablesComponent>;
  let reportService: jasmine.SpyObj<ReportService>;

  beforeEach(async () => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getTopStudentReport',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ModalRiskStudentsVariablesComponent,
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

    fixture = TestBed.createComponent(ModalRiskStudentsVariablesComponent);
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
    reportService.getTopStudentReport.and.returnValue(of(mockResponse));

    component.filterForm.setValue({
      selectComponent: 'test-component',
      selectVariables: { variableId: 1, description: 'test-variable' },
      selectNumber: 10,
    });

    component.showStudentList();

    expect(reportService.getTopStudentReport).toHaveBeenCalledWith(
      1,
      'test-uuid',
      10
    );
    expect(component.studentRisk).toEqual(
      jasmine.arrayContaining(mockResponse.body)
    );
  });
});
