import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '@core/services/api/student.service';
import { PollService } from '@core/services/api/poll.service';
import { PollInstanceService } from '@core/services/api/poll-instance.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PollModel } from '@core/models/poll.model';
import { ComponentsAvgModel } from '@core/models/components-avg.model';
import { AnswerResponse } from '@core/models/answer-request.model';
import { StudentResponse } from '@core/models/student-request.model';
import { PagedResult } from '@core/services/interfaces/page.type';
import { EventLoad } from '@core/models/load';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let pollInsServiceSpy: jasmine.SpyObj<PollInstanceService>;
  let pdfHelperSpy: jasmine.SpyObj<PdfHelper>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockStudentResponse: StudentResponse = {
    entity: {
      uuid: 'u-1',
      name: 'Test Student',
      email: 'test@test.com',
      studentDetail: {
        studentId: 26,
        enrolledCourses: 1,
        gradedCourses: 1,
        timeDeliveryRate: 1,
        avgScore: 1,
        coursesUnderAvg: 0,
        pureScoreDiff: 0,
        standardScoreDiff: 0,
        lastAccessDays: 0,
        id: 1,
      },
      cohortId: 1,
      id: 1,
      isImported: false,
    },
    message: '',
    success: true,
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
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: PollService, useValue: pollServiceSpy },
        { provide: PollInstanceService, useValue: pollInsServiceSpy },
        { provide: PdfHelper, useValue: pdfHelperSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    component.studentId = 26;
    // Deliberately not calling fixture.detectChanges() -- avoids needing to
    // resolve ListComponent/EmptyDataComponent/ng-apexcharts' own dependency
    // trees, since none of the logic under test relies on lifecycle hooks
    // other than ngOnDestroy.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleLoad', () => {
    it('should update pagination and load student details when an event is given', () => {
      studentServiceSpy.getStudentDetailsById.and.returnValue(
        of(mockStudentResponse)
      );
      pollServiceSpy.getPollsByStudentId.and.returnValue(of([]));
      const event: EventLoad = { page: 2, pageSize: 20 };

      component.handleLoad(26, event);

      expect(component.pagination).toEqual({ page: 2, pageSize: 20 });
      expect(studentServiceSpy.getStudentDetailsById).toHaveBeenCalledWith(26, {
        page: 2,
        pageSize: 20,
      });
    });

    it('should load student details without updating pagination when no event is given', () => {
      studentServiceSpy.getStudentDetailsById.and.returnValue(
        of(mockStudentResponse)
      );
      pollServiceSpy.getPollsByStudentId.and.returnValue(of([]));
      const originalPagination = { ...component.pagination };

      component.handleLoad(26, null as unknown as EventLoad);

      expect(component.pagination).toEqual(originalPagination);
      expect(studentServiceSpy.getStudentDetailsById).toHaveBeenCalled();
    });
  });

  describe('getStudentDetails', () => {
    it('should set studentDetails and load polls on success', () => {
      studentServiceSpy.getStudentDetailsById.and.returnValue(
        of(mockStudentResponse)
      );
      pollServiceSpy.getPollsByStudentId.and.returnValue(of([]));

      component.getStudentDetails(26);

      expect(component.studentDetails).toEqual(mockStudentResponse);
      expect(pollServiceSpy.getPollsByStudentId).toHaveBeenCalledWith(26);
    });

    it('should log the error and not throw when the request fails', () => {
      const error = new Error('network error');
      studentServiceSpy.getStudentDetailsById.and.returnValue(
        throwError(() => error)
      );
      const consoleErrorSpy = spyOn(console, 'error');

      expect(() => component.getStudentDetails(26)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('getStudentPolls', () => {
    const polls: PollModel[] = [{ id: 1 } as PollModel, { id: 2 } as PollModel];

    it('should set studentPolls, load components avg for each new poll, and load answers for the first poll', () => {
      pollServiceSpy.getPollsByStudentId.and.returnValue(of(polls));
      pollInsServiceSpy.getComponentsRiskByPollForStudent.and.returnValue(
        of([])
      );
      studentServiceSpy.getStudentAnswersByPoll.and.returnValue(
        of({ items: [], count: 0 } as PagedResult<AnswerResponse>)
      );

      component.getStudentPolls(26);

      expect(component.studentPolls).toEqual(polls);
      expect(
        pollInsServiceSpy.getComponentsRiskByPollForStudent
      ).toHaveBeenCalledWith(26, 1);
      expect(
        pollInsServiceSpy.getComponentsRiskByPollForStudent
      ).toHaveBeenCalledWith(26, 2);
      expect(component.selectedPoll).toBe(1);
      expect(studentServiceSpy.getStudentAnswersByPoll).toHaveBeenCalledWith(
        26,
        1,
        component.pagination
      );
      expect(component.isLoading).toBeFalse();
    });

    it('should not call getComponentsAvg again for a poll already processed', () => {
      pollServiceSpy.getPollsByStudentId.and.returnValue(of(polls));
      pollInsServiceSpy.getComponentsRiskByPollForStudent.and.returnValue(
        of([])
      );
      studentServiceSpy.getStudentAnswersByPoll.and.returnValue(
        of({ items: [], count: 0 } as PagedResult<AnswerResponse>)
      );

      component.getStudentPolls(26);
      component.getStudentPolls(26);

      expect(
        pollInsServiceSpy.getComponentsRiskByPollForStudent
      ).toHaveBeenCalledTimes(2);
    });

    it('should not set selectedPoll or load answers when there are no polls', () => {
      pollServiceSpy.getPollsByStudentId.and.returnValue(of([]));

      component.getStudentPolls(26);

      expect(component.selectedPoll).toBe(0);
      expect(studentServiceSpy.getStudentAnswersByPoll).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });

    it('should log the error and set isLoading to false when the request fails', () => {
      const error = new Error('polls error');
      pollServiceSpy.getPollsByStudentId.and.returnValue(
        throwError(() => error)
      );
      const consoleErrorSpy = spyOn(console, 'error');
      component.isLoading = true;

      component.getStudentPolls(26);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('getComponentsAvg', () => {
    it('should append the response to componentsAvg and rebuild chart series', () => {
      const data: ComponentsAvgModel[] = [
        {
          pollId: 1,
          name: 'familiar',
          componentAvg: 3.456,
        } as ComponentsAvgModel,
      ];
      pollInsServiceSpy.getComponentsRiskByPollForStudent.and.returnValue(
        of(data)
      );

      component.getComponentsAvg(26, 1);

      expect(component.componentsAvg).toEqual(data);
      expect(component.chartSeriesByPollId[1]).toBeTruthy();
    });

    it('should log the error on failure', () => {
      const error = new Error('components avg error');
      pollInsServiceSpy.getComponentsRiskByPollForStudent.and.returnValue(
        throwError(() => error)
      );
      const consoleErrorSpy = spyOn(console, 'error');

      component.getComponentsAvg(26, 1);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('getStudentAnswersByPoll', () => {
    it('should set studentAnswers and totalStudentAnswers on success', () => {
      const result = {
        items: [{ variable: 'v1' } as AnswerResponse],
        count: 1,
      } as PagedResult<AnswerResponse>;
      studentServiceSpy.getStudentAnswersByPoll.and.returnValue(of(result));

      component.getStudentAnswersByPoll(26, 1);

      expect(component.studentAnswers).toEqual(result.items);
      expect(component.totalStudentAnswers).toBe(1);
    });

    it('should log the error on failure', () => {
      const error = new Error('answers error');
      studentServiceSpy.getStudentAnswersByPoll.and.returnValue(
        throwError(() => error)
      );
      const consoleErrorSpy = spyOn(console, 'error');

      component.getStudentAnswersByPoll(26, 1);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('onSlideChange', () => {
    it('should update selectedPoll and load answers when the swiper target has a valid active poll', () => {
      component.studentPolls = [
        { id: 10 } as PollModel,
        { id: 20 } as PollModel,
      ];
      studentServiceSpy.getStudentAnswersByPoll.and.returnValue(
        of({ items: [], count: 0 } as PagedResult<AnswerResponse>)
      );

      const fakeEvent = {
        target: { swiper: { activeIndex: 1 } },
      } as unknown as Event;

      component.onSlideChange(fakeEvent);

      expect(component.selectedPoll).toBe(20);
      expect(studentServiceSpy.getStudentAnswersByPoll).toHaveBeenCalledWith(
        26,
        20,
        component.pagination
      );
    });

    it('should clear studentAnswers when the active index has no matching poll', () => {
      component.studentPolls = [{ id: 10 } as PollModel];
      component.studentAnswers = [{ variable: 'stale' } as AnswerResponse];

      const fakeEvent = {
        target: { swiper: { activeIndex: 5 } },
      } as unknown as Event;

      component.onSlideChange(fakeEvent);

      expect(component.studentAnswers).toEqual([]);
    });

    it('should warn when the event target has no swiper', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      const fakeEvent = { target: {} } as unknown as Event;

      component.onSlideChange(fakeEvent);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Event target doesn't have a swiper"
      );
    });
  });

  describe('buildChartSeries', () => {
    it('should group components by pollId, capitalize names, and round averages to 2 decimals', () => {
      component.componentsAvg = [
        {
          pollId: 1,
          name: 'familiar',
          componentAvg: 3.456,
        } as ComponentsAvgModel,
        {
          pollId: 1,
          name: 'academico',
          componentAvg: 1.234,
        } as ComponentsAvgModel,
      ];

      component.buildChartSeries();

      const series = component.chartSeriesByPollId[1];
      expect(series[0].name).toBe('Component Average');
      const data = series[0].data as { x: string; y: number }[];
      expect(data[0].x).toBe('Familiar');
      expect(data[0].y).toBe(3.46);
      expect(data[1].x).toBe('Academico');
      expect(data[1].y).toBe(1.23);
    });

    it('should leave chartSeriesByPollId untouched when componentsAvg is empty', () => {
      component.componentsAvg = [];

      component.buildChartSeries();

      expect(component.chartSeriesByPollId).toEqual({});
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter and keep the rest unchanged', () => {
      expect(component.capitalize('familiar')).toBe('Familiar');
    });

    it('should return an empty string unchanged', () => {
      expect(component.capitalize('')).toBe('');
    });
  });

  describe('exportReportPdf', () => {
    it('should call pdfHelper.exportToPdf with the expected config', async () => {
      pdfHelperSpy.exportToPdf.and.returnValue(Promise.resolve());

      await component.exportReportPdf();

      expect(pdfHelperSpy.exportToPdf).toHaveBeenCalledWith({
        fileName: 'student-detail',
        container: component.mainContainer,
        preProcess: 'student-detail',
        snackBar: snackBarSpy,
      });
    });

    it('should not call exportToPdf again while a PDF is already being generated', async () => {
      component.isGeneratingPDF = true;

      await component.exportReportPdf();

      expect(pdfHelperSpy.exportToPdf).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the destroy$ subject', () => {
      const destroy$ = (component as unknown as { destroy$: Subject<void> })
        .destroy$;
      const nextSpy = spyOn(destroy$, 'next').and.callThrough();
      const completeSpy = spyOn(destroy$, 'complete').and.callThrough();

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
