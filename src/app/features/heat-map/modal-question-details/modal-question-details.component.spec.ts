import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from './modal-question-details.component';
import { ReportService } from '../../../core/services/report.service.ts.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { VariableService } from '../../../core/services/variable/variable.service';
import { PollAvgQuestion } from '../../../core/models/summary.model';

describe('ModalQuestionDetailsComponent', () => {
  let component: ModalQuestionDetailsComponent;
  let fixture: ComponentFixture<ModalQuestionDetailsComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let variableService: jasmine.SpyObj<VariableService>;

  const mockQuestion: PollAvgQuestion = {
    question: 'Test Question',
    averageRisk: 3,
    averageAnswer: 'Test Answer',
    answersDetails: [
      {
        answerText: 'Test answer',
        answerPercentage: 100,
        studentsEmails: ['test@test.com'],
      },
    ],
  };

  const mockDialogData: SelectedHMData = {
    cohortId: 'cohort-1',
    pollUuid: 'test-uuid',
    componentName: 'Test Component',
    question: mockQuestion,
  };

  beforeEach(async () => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getTopPollReport',
    ]);

    const variableServiceSpy = jasmine.createSpyObj('VariableService', [
      'getVariablesByPollUuid',
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
          useValue: mockDialogData,
        },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: VariableService, useValue: variableServiceSpy },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(ModalQuestionDetailsComponent);
    component = fixture.componentInstance;
    reportService = TestBed.inject(
      ReportService
    ) as jasmine.SpyObj<ReportService>;
    variableService = TestBed.inject(
      VariableService
    ) as jasmine.SpyObj<VariableService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct input data', () => {
    expect(component.inputQuestion).toEqual(mockDialogData);
  });

  it('should call getVariablesByPollUuid on initialization', () => {
    const mockVariablesResponse = [
      {
        name: 'Is this a test?',
        type: '',
        audit: null,
        idComponent: 0,
        pollVariableId: 0,
        idPoll: 0,
        id: 31,
      },
    ];

    variableService.getVariablesByPollUuid.and.returnValue(
      of(mockVariablesResponse)
    );
    reportService.getTopPollReport.and.returnValue(
      of({
        success: true,
        message: 'Success',
        validationErrors: null,
        body: [],
      })
    );

    component.ngOnInit();

    expect(variableService.getVariablesByPollUuid).toHaveBeenCalledWith(
      'test-uuid',
      ['test component']
    );
    expect(component.variableId).toBe(0);
  });

  it('should not call getTopPollReport when variableId is 0', () => {
    // Ensure variableId is 0
    component.variableId = 0;

    component.loadStudentList();

    expect(reportService.getTopPollReport).not.toHaveBeenCalled();
  });

  it('should handle empty response from getTopPollReport', () => {
    component.variableId = 123;

    const mockResponse = {
      success: true,
      message: 'Success',
      validationErrors: null,
      body: [],
    };

    reportService.getTopPollReport.and.returnValue(of(mockResponse));

    component.loadStudentList();

    expect(component.studentsRisk).toEqual([]);
  });

  it('should get correct risk color based on risk level', () => {
    // Test various risk levels
    expect(component.getRiskColor(1)).toBeDefined();
    expect(component.getRiskColor(2)).toBeDefined();
    expect(component.getRiskColor(3)).toBeDefined();
  });

  it('should open student details in new tab', () => {
    spyOn(window, 'open');

    component.openStudentDetails(123);

    expect(window.open).toHaveBeenCalledWith('student-details/123', '_blank');
  });

  it('should close dialog when onClose is called', () => {
    component.onClose();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});
