import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StudentDetailV2Component } from './student-detail-v2.component';
import { StudentService } from '@core/services/api/student.service';
import { PollService } from '@core/services/api/poll.service';
import { PollInstanceService } from '@core/services/api/poll-instance.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { StudentResponse } from '@core/models/student-request.model';
import { PollModel } from '@core/models/poll.model';
import { ComponentsAvgModel } from '@core/models/components-avg.model';
import { AnswerResponse } from '@core/models/answer-request.model';
import { PagedResult } from '@core/services/interfaces/page.type';
import * as RiskLevel from '@core/constants/riskLevel';

describe('StudentDetailV2Component', () => {
  let component: StudentDetailV2Component;
  let fixture: ComponentFixture<StudentDetailV2Component>;

  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let pollInsServiceSpy: jasmine.SpyObj<PollInstanceService>;
  let pdfHelperSpy: jasmine.SpyObj<PdfHelper>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockStudentResponse: StudentResponse = {
    entity: {
      uuid: 'uuid-123',
      name: 'John Doe',
      email: 'john@test.com',
      studentDetail: {
        studentId: 1,
        enrolledCourses: 5,
        gradedCourses: 3,
        timeDeliveryRate: 90,
        avgScore: 85,
        coursesUnderAvg: 1,
        pureScoreDiff: 2,
        standardScoreDiff: 0.5,
        lastAccessDays: 2,
        id: 1,
      },
      cohortId: 1,
      id: 1,
      isImported: false,
    },
    message: '',
    success: true,
  } as StudentResponse;

  const mockPolls: PollModel[] = [{ id: 10 }, { id: 20 }] as PollModel[];

  const mockComponentsAvg: ComponentsAvgModel[] = [
    { pollId: 10, name: 'academico', componentAvg: 3.2 },
    { pollId: 10, name: 'socioeconomico', componentAvg: 1.5 },
  ] as ComponentsAvgModel[];

  const mockAnswersPage: PagedResult<AnswerResponse> = {
    items: [
      {
        variable: 'v1',
        position: 1,
        component: 'academico',
        answer: 'yes',
        score: 3,
      } as AnswerResponse,
    ],
    count: 1,
  };

  beforeEach(async () => {
    studentServiceSpy = jasmine.createSpyObj('StudentService', [
      'getStudentDetailsById',
      'getStudentAnswersByPoll',
    ]);
    pollServiceSpy = jasmine.createSpyObj('PollService', [
      'getPollsByStudentId',
    ]);
    pollInsServiceSpy = jasmine.createSpyObj('PollInstanceService', [
      'getComponentsRiskByPollForStudent',
    ]);
    pdfHelperSpy = jasmine.createSpyObj('PdfHelper', ['exportToPdf']);

    // IMPORTANT: Router mock needs `events` (BreadcrumbsService subscribes
    // to router.events.pipe(...) in its constructor).
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(null),
      url: '/',
    });

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    studentServiceSpy.getStudentDetailsById.and.returnValue(
      of(mockStudentResponse)
    );
    studentServiceSpy.getStudentAnswersByPoll.and.returnValue(
      of(mockAnswersPage)
    );
    pollServiceSpy.getPollsByStudentId.and.returnValue(of(mockPolls));
    pollInsServiceSpy.getComponentsRiskByPollForStudent.and.returnValue(
      of(mockComponentsAvg)
    );

    await TestBed.configureTestingModule({
      imports: [StudentDetailV2Component],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: PollService, useValue: pollServiceSpy },
        { provide: PollInstanceService, useValue: pollInsServiceSpy },
        { provide: PdfHelper, useValue: pdfHelperSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap({}),
              data: {},
              url: [],
            },
            paramMap: of(convertToParamMap({})),
            queryParamMap: of(convertToParamMap({})),
            data: of({}),
            url: of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailV2Component);
    component = fixture.componentInstance;
    component.studentId = 1;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit / data loading chain', () => {
    it('should load student details, polls, components avg and answers on init', () => {
      component.ngOnInit();

      expect(studentServiceSpy.getStudentDetailsById).toHaveBeenCalledWith(
        1,
        component.pagination
      );
      expect(component.studentDetails).toEqual(mockStudentResponse);
      expect(pollServiceSpy.getPollsByStudentId).toHaveBeenCalledWith(1);
      expect(component.studentPolls).toEqual(mockPolls);
      expect(component.selectedPoll).toBe(mockPolls[0].id);
      expect(
        pollInsServiceSpy.getComponentsRiskByPollForStudent
      ).toHaveBeenCalledWith(1, mockPolls[0].id);
      expect(
        pollInsServiceSpy.getComponentsRiskByPollForStudent
      ).toHaveBeenCalledWith(1, mockPolls[1].id);
      expect(studentServiceSpy.getStudentAnswersByPoll).toHaveBeenCalledWith(
        1,
        mockPolls[0].id,
        component.pagination
      );
      expect(component.studentAnswers).toEqual(mockAnswersPage.items);
      expect(component.totalStudentAnswers).toBe(mockAnswersPage.count);
    });

    it('should log an error if getStudentDetailsById fails', () => {
      const consoleSpy = spyOn(console, 'error');
      studentServiceSpy.getStudentDetailsById.and.returnValue(
        throwError(() => new Error('boom'))
      );

      component.ngOnInit();

      expect(consoleSpy).toHaveBeenCalled();
      expect(pollServiceSpy.getPollsByStudentId).not.toHaveBeenCalled();
    });

    it('should log an error if getPollsByStudentId fails', () => {
      const consoleSpy = spyOn(console, 'error');
      pollServiceSpy.getPollsByStudentId.and.returnValue(
        throwError(() => new Error('boom'))
      );

      component.ngOnInit();

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not call getComponentsAvg twice for an already-processed poll', () => {
      component.ngOnInit();
      pollInsServiceSpy.getComponentsRiskByPollForStudent.calls.reset();

      component.getStudentPolls(1);

      expect(
        pollInsServiceSpy.getComponentsRiskByPollForStudent
      ).not.toHaveBeenCalled();
    });

    it('should not fetch answers when there are no polls', () => {
      pollServiceSpy.getPollsByStudentId.and.returnValue(of([]));

      component.ngOnInit();

      expect(component.studentPolls).toEqual([]);
      expect(component.selectedPoll).toBe(0);
    });
  });

  describe('getStudentAnswersByPoll', () => {
    it('should not call the service when pollId is 0', () => {
      component.getStudentAnswersByPoll(1, 0);
      expect(studentServiceSpy.getStudentAnswersByPoll).not.toHaveBeenCalled();
    });

    it('should log an error when the answers request fails', () => {
      const consoleSpy = spyOn(console, 'error');
      studentServiceSpy.getStudentAnswersByPoll.and.returnValue(
        throwError(() => new Error('boom'))
      );

      component.getStudentAnswersByPoll(1, 10);

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('handleLoad', () => {
    it('should update pagination and skip fetching when selectedPoll is 0', () => {
      component.selectedPoll = 0;
      component.handleLoad(1, { page: 2, pageSize: 20 });

      expect(component.pagination).toEqual({ page: 2, pageSize: 20 });
      expect(studentServiceSpy.getStudentAnswersByPoll).not.toHaveBeenCalled();
    });

    it('should fetch answers when a poll is selected', () => {
      component.selectedPoll = 10;
      component.handleLoad(1, { page: 1, pageSize: 5 });

      expect(component.pagination).toEqual({ page: 1, pageSize: 5 });
      expect(studentServiceSpy.getStudentAnswersByPoll).toHaveBeenCalledWith(
        1,
        10,
        { page: 1, pageSize: 5 }
      );
    });
  });

  describe('createAssessment', () => {
    it('should close the dialog and navigate to assessments with preselected student', () => {
      component.createAssessment();

      expect(dialogRefSpy.close).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/assessments'], {
        state: { preselectedStudentId: component.studentId },
      });
    });
  });

  describe('buildChartSeries', () => {
    it('should group and order components by pollId following COMPONENT_ORDER', () => {
      component.componentsAvg = [
        { pollId: 10, name: 'academico', componentAvg: 3.256 },
        { pollId: 10, name: 'socioeconomico', componentAvg: 1.5 },
        { pollId: 10, name: 'familiar', componentAvg: 2.1 },
        { pollId: 10, name: 'individual', componentAvg: 4.4 },
      ] as ComponentsAvgModel[];

      component.buildChartSeries();

      const series = component.chartSeriesByPollId[10];
      expect(series).toBeTruthy();
      const data = series[0].data as { x: string; y: number }[];
      expect(data.map(d => d.x)).toEqual([
        'Socioeconomico',
        'Familiar',
        'Individual',
        'Academico',
      ]);
      expect(data[0].y).toBe(1.5);
    });

    it('should produce no series when componentsAvg is empty', () => {
      component.componentsAvg = [];
      component.buildChartSeries();
      expect(component.chartSeriesByPollId).toEqual({});
    });
  });

  describe('getColorByRisk / capitalize', () => {
    it('should return the same color as getRiskColor for the floored value', () => {
      const expected = RiskLevel.getRiskColor(Math.floor(3.9)) ?? '#CCC';
      expect(component.getColorByRisk(3.9)).toBe(expected);
    });

    it('should capitalize the first letter only', () => {
      expect(component.capitalize('academico')).toBe('Academico');
    });
  });

  describe('exportCsv', () => {
    it('should build and trigger a CSV download using all fetched answers', async () => {
      component.ngOnInit();
      studentServiceSpy.getStudentAnswersByPoll.calls.reset();
      studentServiceSpy.getStudentAnswersByPoll.and.returnValue(
        of(mockAnswersPage)
      );

      const clickSpy = jasmine.createSpy('click');
      spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        click: clickSpy,
      } as unknown as HTMLAnchorElement);
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');

      await component.exportCsv();

      expect(studentServiceSpy.getStudentAnswersByPoll).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('exportReportPdf', () => {
    it('should delegate to PdfHelper.exportToPdf and reset the generating flag', async () => {
      component.ngOnInit();
      pdfHelperSpy.exportToPdf.and.returnValue(Promise.resolve());

      await component.exportReportPdf();

      expect(pdfHelperSpy.exportToPdf).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fileName: 'student-detail',
          preProcess: 'student-detail',
        })
      );
      expect(component.isGeneratingPDF).toBeFalse();
    });

    it('should be a no-op when a PDF export is already in progress', async () => {
      component.isGeneratingPDF = true;

      await component.exportReportPdf();

      expect(pdfHelperSpy.exportToPdf).not.toHaveBeenCalled();
    });

    it('should restore original answers/pagination even if exportToPdf throws', async () => {
      component.ngOnInit();
      const originalAnswers = component.studentAnswers;
      pdfHelperSpy.exportToPdf.and.returnValue(
        Promise.reject(new Error('pdf failed'))
      );

      await expectAsync(component.exportReportPdf()).toBeRejected();

      expect(component.studentAnswers).toEqual(originalAnswers);
      expect(component.isGeneratingPDF).toBeFalse();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the destroy subject', () => {
      const destroy$ = (
        component as unknown as {
          destroy$: { next: jasmine.Spy; complete: jasmine.Spy };
        }
      ).destroy$;

      const nextSpy = spyOn(destroy$, 'next');
      const completeSpy = spyOn(destroy$, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
