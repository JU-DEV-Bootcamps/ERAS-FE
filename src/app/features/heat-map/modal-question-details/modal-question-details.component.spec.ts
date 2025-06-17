import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from './modal-question-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { PollAvgQuestion } from '../../../core/models/summary.model';
import { ReportService } from '../../../core/services/api/report.service';
import { PollService } from '../../../core/services/api/poll.service';
import { ActivatedRoute } from '@angular/router';

describe('ModalQuestionDetailsComponent', () => {
  let component: ModalQuestionDetailsComponent;
  let fixture: ComponentFixture<ModalQuestionDetailsComponent>;
  let reportService: jasmine.SpyObj<ReportService>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
    params: of({}),
    queryParams: of({}),
  };
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
        { provide: PollService, useValue: variableServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(ModalQuestionDetailsComponent);
    component = fixture.componentInstance;
    reportService = TestBed.inject(
      ReportService
    ) as jasmine.SpyObj<ReportService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct input data', () => {
    expect(component.inputQuestion).toEqual(mockDialogData);
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

  it('should close dialog when onClose is called', () => {
    component.onClose();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});
