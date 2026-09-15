import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryChartsComponent } from './summary-charts.component';
import { StudentService } from '@core/services/api/student.service';
import { ReportService } from '@core/services/api/report.service';
import { PdfService } from '@core/services/exports/pdf.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import {
  GetQueryResponse,
  PollAvgComponent,
  PollAvgQuestion,
  PollAvgReport,
} from '@core/models/summary.model';
import { CohortModel } from '@core/models/cohort.model';
import { SummarySerie } from '@core/models/heatmap-data.model';
import { Filter } from '../poll-filters/types/filters';
import { StudentRiskAverage } from '@core/services/interfaces/student.interface';
import {
  ListComponent,
  TypeFile,
} from '@shared/components/list/list.component';
import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { PollFiltersComponent } from '../poll-filters/poll-filters.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PdfHelper } from '../../../../core/utils/reports/exportReport.util';
import { PagedResult } from '@core/services/interfaces/page.type';
import { ComponentValueType } from '../../../../core/models/types/risk-students-detail.type';
import { ModalQuestionDetailsComponent } from '@shared/components/modals/modal-question-details/modal-question-details.component';

type ChartClickFn = (
  e: unknown,
  chart: unknown,
  options: { dataPointIndex: number; seriesIndex: number }
) => void;

type TooltipCustomFn = (options: {
  seriesIndex: number;
  dataPointIndex: number;
  series: unknown[];
  w: unknown;
}) => string;

type StudentsResponse = PagedResult<StudentRiskAverage>;

describe('SummaryChartsComponent', () => {
  let component: SummaryChartsComponent;
  let fixture: ComponentFixture<SummaryChartsComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let pdfHelperSpy: jasmine.SpyObj<PdfHelper>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;
  let pdfServiceSpy: jasmine.SpyObj<PdfService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    studentServiceSpy = jasmine.createSpyObj<StudentService>('StudentService', [
      'getAllAverageByCohortsAndPoll',
    ]);
    pdfHelperSpy = jasmine.createSpyObj<PdfHelper>('PdfHelper', [
      'exportToPdf',
    ]);
    reportServiceSpy = jasmine.createSpyObj<ReportService>('ReportService', [
      'getAvgPoolReport',
      'getHMSeriesFromAvgReport',
      'regroupSummaryByColor',
    ]);
    pdfServiceSpy = jasmine.createSpyObj<PdfService>('PdfService', [
      'exportToPDF',
    ]);
    matDialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SummaryChartsComponent,
        ListComponent,
        EmptyDataComponent,
        PollFiltersComponent,
      ],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: PdfService, useValue: pdfServiceSpy },
        { provide: PdfHelper, useValue: pdfHelperSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have properly configured columns', () => {
    expect(component.columns.length).toBe(3);
    expect(component.columns[0].key).toBe('studentName');
    expect(component.columns[1].key).toBe('email');
    expect(component.columns[2].key).toBe('avgRiskLevel');
    expect(component.columns[2].pipe).toBeDefined();
  });

  describe('getStudentsByCohortAndPoll / _loadStudents', () => {
    it('should call getAllAverageByCohortsAndPoll and update students and totalStudents', () => {
      const mockStudents: PagedResult<StudentRiskAverage> = {
        items: [
          {
            studentName: 'Test',
            email: 'test@test.com',
            avgRiskLevel: 1,
            studentId: 1,
          },
        ],
        count: 1,
      };
      studentServiceSpy.getAllAverageByCohortsAndPoll.and.returnValue(
        of(mockStudents)
      );
      component.cohortIds = [1];
      component.pollUuid = 'poll-uuid';
      component.getStudentsByCohortAndPoll({ pageSize: 10, page: 0 });
      expect(
        studentServiceSpy.getAllAverageByCohortsAndPoll
      ).toHaveBeenCalledWith({
        cohortIds: [1],
        pollUuid: 'poll-uuid',
        page: 0,
        pageSize: 10,
        lastVersion: true,
        evaluationId: undefined,
      });
      expect(component.students).toEqual(mockStudents.items);
      expect(component.totalStudents).toBe(1);
    });

    it('should handle error from studentService and set isLoading to false', () => {
      component.cohortIds = [1];
      component.pollUuid = 'poll-uuid';
      component.isLoading = true;
      studentServiceSpy.getAllAverageByCohortsAndPoll.and.returnValue(
        throwError(() => new Error('error'))
      );

      component.getStudentsByCohortAndPoll({ pageSize: 10, page: 0 });
      expect(component.isLoading).toBeFalse();
    });

    it('should set students to empty array if no cohortIds or pollUuid', () => {
      component.cohortIds = [];
      component.pollUuid = '';

      component.getStudentsByCohortAndPoll({ page: 0, pageSize: 10 });

      expect(component.students).toEqual([]);
      expect(component.totalStudents).toBe(0);
      expect(component.isLoading).toBeFalse();
      expect(
        studentServiceSpy.getAllAverageByCohortsAndPoll
      ).not.toHaveBeenCalled();
    });

    it('should set hasNoResults to true when count is 0 and components is empty', () => {
      component.cohortIds = [1];
      component.pollUuid = 'poll-uuid';
      component.components.set(null);
      studentServiceSpy.getAllAverageByCohortsAndPoll.and.returnValue(
        of({ items: [], count: 0 })
      );

      component.getStudentsByCohortAndPoll({ page: 0, pageSize: 10 });

      expect(component.hasNoResults).toBeTrue();
      expect(component.students).toEqual([]);
      expect(component.totalStudents).toBe(0);
    });

    it('should set hasNoResults to false when count is 0 but components are loaded', () => {
      component.cohortIds = [1];
      component.pollUuid = 'poll-uuid';
      component.components.set({
        components: [
          { description: 'Familiar', questions: [] },
        ] as unknown as PollAvgComponent[],
        pollCount: 1,
      });
      studentServiceSpy.getAllAverageByCohortsAndPoll.and.returnValue(
        of({ items: [], count: 0 })
      );

      component.getStudentsByCohortAndPoll({ page: 0, pageSize: 10 });

      expect(component.hasNoResults).toBeFalse();
    });
  });

  describe('getHeatMap', () => {
    it('should clear chartOptions and return early if pollUuid or cohortIds are empty', () => {
      component.pollUuid = '';
      component.cohortIds = [];
      component.isLoading = true;

      component.getHeatMap();

      expect(component.chartOptions).toEqual({});
      expect(component.isLoading).toBeFalse();
      expect(reportServiceSpy.getAvgPoolReport).not.toHaveBeenCalled();
    });

    it('should handle error from getAvgPoolReport', () => {
      reportServiceSpy.getAvgPoolReport.and.returnValue(
        throwError(() => new Error('error'))
      );
      component.pollUuid = 'poll-uuid';
      component.cohortIds = [1];
      component.isLoading = true;

      component.getHeatMap();

      expect(component.isLoading).toBeFalse();
      expect(component.hasNoResults).toBeTrue();
    });

    it('should call getAvgPoolReport and set chartOptions', () => {
      const mockReport: GetQueryResponse<PollAvgReport> = {
        body: { components: [], pollCount: 0 },
        status: 'success',
      };
      const mockSeries = [
        {
          description: 'FAMILIAR' as ComponentValueType,
          name: 'FAMILIAR' as ComponentValueType,
          text: 'Familiar description',
          data: [],
        },
      ];
      reportServiceSpy.getAvgPoolReport.and.returnValue(of(mockReport));
      reportServiceSpy.getHMSeriesFromAvgReport.and.returnValue(mockSeries);
      reportServiceSpy.regroupSummaryByColor.and.returnValue(mockSeries);

      component.pollUuid = 'poll-uuid';
      component.cohortIds = [1];
      component.getHeatMap();

      expect(reportServiceSpy.getAvgPoolReport).toHaveBeenCalledWith(
        'poll-uuid',
        [1],
        true,
        undefined
      );
      expect(component.chartOptions).toBeDefined();
    });

    it('should set hasNoResults to true if response body has no components in getHeatMap', () => {
      const mockReport: GetQueryResponse<PollAvgReport> = {
        body: { components: [], pollCount: 0 },
        status: 'success',
      };
      reportServiceSpy.getAvgPoolReport.and.returnValue(of(mockReport));
      reportServiceSpy.getHMSeriesFromAvgReport.and.returnValue([]);
      reportServiceSpy.regroupSummaryByColor.and.returnValue([]);

      component.pollUuid = 'poll-uuid';
      component.cohortIds = [1];
      component.getHeatMap();

      expect(component.hasNoResults).toBeTrue();
    });

    it('should set hasNoResults to false if response body has components in getHeatMap', () => {
      const mockReport: GetQueryResponse<PollAvgReport> = {
        body: {
          components: [
            {
              description: 'FAMILIAR',
              questions: [],
              text: 'desc',
            } as unknown as PollAvgComponent,
          ],
          pollCount: 1,
        },
        status: 'success',
      };
      reportServiceSpy.getAvgPoolReport.and.returnValue(of(mockReport));
      reportServiceSpy.getHMSeriesFromAvgReport.and.returnValue([]);
      reportServiceSpy.regroupSummaryByColor.and.returnValue([]);

      component.pollUuid = 'poll-uuid';
      component.cohortIds = [1];
      component.getHeatMap();

      expect(component.hasNoResults).toBeFalse();
    });

    it('should execute dataPointSelection callback from chartOptions if generated', () => {
      const mockQuestion = {
        question: 'Q1',
        averageRisk: 1,
        position: 0,
      } as PollAvgQuestion;
      const mockReport: GetQueryResponse<PollAvgReport> = {
        body: {
          components: [
            {
              description: 'FAMILIAR',
              text: 'Familiar text',
              questions: [mockQuestion],
            } as unknown as PollAvgComponent,
          ],
          pollCount: 1,
        },
        status: 'success',
      };
      const mockSeries = [
        {
          description: 'FAMILIAR',
          name: 'FAMILIAR',
          text: 'Familiar text',
          data: [{ x: 'Q1', y: 1, position: 0 }],
        },
      ] as unknown as ReturnType<ReportService['regroupSummaryByColor']>;

      reportServiceSpy.getAvgPoolReport.and.returnValue(of(mockReport));
      reportServiceSpy.getHMSeriesFromAvgReport.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['getHMSeriesFromAvgReport']
        >
      );
      reportServiceSpy.regroupSummaryByColor.and.returnValue(mockSeries);

      component.pollUuid = 'poll-uuid';
      component.cohortIds = [1];
      component.getHeatMap();

      const clickHandler =
        component.chartOptions.chart?.events?.dataPointSelection;
      if (clickHandler) {
        spyOn(component, 'openDetailsModal');
        (clickHandler as unknown as ChartClickFn)({}, undefined, {
          dataPointIndex: 0,
          seriesIndex: 0,
        });
        expect(component.openDetailsModal).toHaveBeenCalledWith(
          mockQuestion,
          'FAMILIAR' as ComponentValueType,
          'Familiar text'
        );
      }
    });

    it('should log error if question is not found in dataPointSelection', () => {
      const mockReport: GetQueryResponse<PollAvgReport> = {
        body: {
          components: [
            {
              description: 'FAMILIAR',
              text: 'Familiar text',
              questions: [],
            } as unknown as PollAvgComponent,
          ],
          pollCount: 1,
        },
        status: 'success',
      };
      const mockSeries = [
        {
          description: 'FAMILIAR',
          name: 'FAMILIAR',
          text: 'Familiar text',
          data: [{ x: 'Q99', y: 99 }],
        },
      ] as unknown as ReturnType<ReportService['regroupSummaryByColor']>;

      reportServiceSpy.getAvgPoolReport.and.returnValue(of(mockReport));
      reportServiceSpy.getHMSeriesFromAvgReport.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['getHMSeriesFromAvgReport']
        >
      );
      reportServiceSpy.regroupSummaryByColor.and.returnValue(mockSeries);

      component.pollUuid = 'poll-uuid';
      component.cohortIds = [1];
      component.getHeatMap();

      const clickHandler =
        component.chartOptions.chart?.events?.dataPointSelection;
      if (clickHandler) {
        spyOn(console, 'error');
        (clickHandler as unknown as ChartClickFn)({}, undefined, {
          dataPointIndex: 0,
          seriesIndex: 0,
        });
        expect(console.error).toHaveBeenCalledWith(
          'Error getting question from report.'
        );
      }
    });

    it('should execute custom tooltip callback from chartOptions if generated', () => {
      const mockReport: GetQueryResponse<PollAvgReport> = {
        body: {
          components: [
            {
              description: 'FAMILIAR',
              text: 'Familiar text',
              questions: [],
            } as unknown as PollAvgComponent,
          ],
          pollCount: 1,
        },
        status: 'success',
      };
      const mockSeries = [
        {
          description: 'FAMILIAR',
          name: 'FAMILIAR',
          text: 'Familiar text',
          data: [{ x: 'Category 1', y: 4, z: 'Answers details' }],
        },
      ] as unknown as ReturnType<ReportService['regroupSummaryByColor']>;

      reportServiceSpy.getAvgPoolReport.and.returnValue(of(mockReport));
      reportServiceSpy.getHMSeriesFromAvgReport.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['getHMSeriesFromAvgReport']
        >
      );
      reportServiceSpy.regroupSummaryByColor.and.returnValue(mockSeries);

      component.pollUuid = 'poll-uuid';
      component.cohortIds = [1];
      component.getHeatMap();

      const tooltipFn = component.chartOptions.tooltip?.custom;
      if (typeof tooltipFn === 'function') {
        const html = (tooltipFn as unknown as TooltipCustomFn)({
          seriesIndex: 0,
          dataPointIndex: 0,
          series: [],
          w: {},
        });
        expect(typeof html).toBe('string');
      }
    });
  });

  describe('Modal and Tooltips', () => {
    it('should open details modal when openDetailsModal is called', () => {
      const question = { question: 'Q', averageRisk: 1 } as PollAvgQuestion;
      component.pollUuid = 'poll-uuid';
      component.selectedCohort = { id: 1, name: 'Cohort' } as CohortModel;
      component.openDetailsModal(
        question,
        'FAMILIAR' as ComponentValueType,
        'Component test'
      );
      expect(matDialogSpy.open).toHaveBeenCalled();
    });

    it('should not open modal if pollUuid is missing', () => {
      const question = { question: 'Q', averageRisk: 1 } as PollAvgQuestion;
      component.pollUuid = '';
      component.openDetailsModal(
        question,
        'FAMILIAR' as ComponentValueType,
        'Component test'
      );
      expect(matDialogSpy.open).not.toHaveBeenCalled();
    });

    it('should pass correct modal data including joined cohortIds and fallback text', () => {
      const question = { question: 'Q', averageRisk: 1 } as PollAvgQuestion;
      component.pollUuid = 'poll-uuid';
      component.cohortIds = [10, 20];
      component.evaluationId = 5;

      component.openDetailsModal(question, 'FAMILIAR' as ComponentValueType);

      expect(matDialogSpy.open).toHaveBeenCalledWith(
        ModalQuestionDetailsComponent,
        {
          data: {
            cohortId: '10,20',
            pollUuid: 'poll-uuid',
            componentName: 'FAMILIAR' as ComponentValueType,
            text: 'FAMILIAR',
            question,
            evaluationId: 5,
          },
        }
      );
    });

    it('should pass provided text when text parameter is passed to openDetailsModal', () => {
      const question = { question: 'Q', averageRisk: 1 } as PollAvgQuestion;
      component.pollUuid = 'poll-uuid';
      component.cohortIds = [10];
      component.evaluationId = 5;

      component.openDetailsModal(
        question,
        'FAMILIAR' as ComponentValueType,
        'Custom Text'
      );

      expect(matDialogSpy.open).toHaveBeenCalledWith(
        ModalQuestionDetailsComponent,
        {
          data: {
            cohortId: '10',
            pollUuid: 'poll-uuid',
            componentName: 'FAMILIAR' as ComponentValueType,
            text: 'Custom Text',
            question,
            evaluationId: 5,
          },
        }
      );
    });
  });

  describe('exportReportPdf', () => {
    it('should call exportToPdf when exportReportPdf is called', async () => {
      const fakeElement = document.createElement('div');
      component.contentToExport = new ElementRef(fakeElement);
      spyOn(document.body, 'appendChild').and.callThrough();
      spyOn(document.body, 'removeChild').and.callThrough();
      await component.exportReportPdf();
      expect(pdfHelperSpy.exportToPdf).toHaveBeenCalled();
    });

    it('should exit early if isGeneratingPDF is true', async () => {
      component.isGeneratingPDF = true;
      await component.exportReportPdf();
      expect(pdfHelperSpy.exportToPdf).not.toHaveBeenCalled();
    });

    it('should set isGeneratingPDF to false after exportReportPdf completes', async () => {
      const fakeElement = document.createElement('div');
      component.contentToExport = new ElementRef(fakeElement);
      pdfHelperSpy.exportToPdf.and.resolveTo();

      await component.exportReportPdf();

      expect(component.isGeneratingPDF).toBeFalse();
    });
  });

  describe('handleFilterSelect', () => {
    it('should update filters and call _loadStudents and getHeatMap on valid selection', () => {
      spyOn(component, 'getHeatMap');
      spyOn(
        component as unknown as { _loadStudents: () => void },
        '_loadStudents'
      ).and.stub();
      const filters = { cohortIds: [1], title: 'Test', uuid: 'poll-uuid' };

      component.handleFilterSelect(filters as Filter);

      expect(component.cohortIds).toEqual([1]);
      expect(component.title).toBe('Test');
      expect(component.pollUuid).toBe('poll-uuid');
      expect(component.getHeatMap).toHaveBeenCalled();
    });

    it('should set evaluationId and lastVersion when handleFilterSelect is called', () => {
      spyOn(component, 'getHeatMap');
      spyOn(
        component as unknown as { _loadStudents: () => void },
        '_loadStudents'
      ).and.stub();

      const filter: Filter = {
        cohortIds: [1],
        title: 'Title',
        uuid: 'uuid',
        lastVersion: false,
        evaluationId: 99,
        variableIds: [],
        selectedComponents: [],
      };

      component.handleFilterSelect(filter);

      expect(component.lastVersion).toBeFalse();
      expect(component.evaluationId).toBe(99);
      expect(component.isLoading).toBeTrue();
    });

    it('should reset state if filters are missing uuid or cohortIds', () => {
      component.handleFilterSelect({
        uuid: '',
        cohortIds: [],
      } as unknown as Filter);

      expect(component.chartOptions).toEqual({});
      expect(component.students).toEqual([]);
    });

    it('should reset chartOptions and students if cohortIds is empty in handleFilterSelect', () => {
      component.chartOptions = { series: [{ name: 'A', data: [] }] };
      component.students = [
        { studentName: 'Test' },
      ] as unknown as StudentRiskAverage[];

      component.handleFilterSelect({
        uuid: 'poll-123',
        cohortIds: [],
      } as unknown as Filter);

      expect(component.chartOptions).toEqual({});
      expect(component.students).toEqual([]);
    });

    it('should reset chartOptions and students if uuid is empty in handleFilterSelect', () => {
      component.chartOptions = { series: [{ name: 'A', data: [] }] };
      component.students = [
        { studentName: 'Test' },
      ] as unknown as StudentRiskAverage[];

      component.handleFilterSelect({
        uuid: '',
        cohortIds: [1],
      } as unknown as Filter);

      expect(component.chartOptions).toEqual({});
      expect(component.students).toEqual([]);
    });
  });

  describe('getPollAvgQuestionFromSeries', () => {
    it('should return null if it does not find a match', () => {
      const report = { components: [{ description: 'desc', questions: [] }] };
      const result = component.getPollAvgQuestionFromSeries(
        report as unknown as PollAvgReport,
        'desc',
        { x: 'Q', y: 1 } as SummarySerie
      );
      expect(result).toBeNull();
    });

    it('should return null if reportComponent is not found in getPollAvgQuestionFromSeries', () => {
      const report = { components: [{ description: 'other', questions: [] }] };
      const result = component.getPollAvgQuestionFromSeries(
        report as unknown as PollAvgReport,
        'nonexistent',
        { x: 'Q', y: 1 } as SummarySerie
      );
      expect(result).toBeNull();
    });

    it('should return question if matched exactly', () => {
      const report = {
        components: [
          {
            description: 'Comp1',
            questions: [{ question: 'Q1', averageRisk: 2, position: 1 }],
          },
        ],
      } as unknown as PollAvgReport;

      const result = component.getPollAvgQuestionFromSeries(report, 'Comp1', {
        x: 'Q1',
        y: 2,
        position: 1,
      } as SummarySerie);
      expect(result).toEqual({
        question: 'Q1',
        averageRisk: 2,
        position: 1,
      } as unknown as PollAvgQuestion);
    });

    it('should match question when question.position is undefined', () => {
      const targetQuestion = {
        question: 'Q1',
        averageRisk: 2,
        position: undefined,
      };
      const report = {
        components: [
          {
            description: 'Comp1',
            questions: [targetQuestion],
          },
        ],
      } as unknown as PollAvgReport;

      const result = component.getPollAvgQuestionFromSeries(report, 'Comp1', {
        x: 'Q1',
        y: 2,
        position: 5,
      } as SummarySerie);
      expect(result).toEqual(targetQuestion as unknown as PollAvgQuestion);
    });

    it('should return null when question positions do not match', () => {
      const report = {
        components: [
          {
            description: 'Comp1',
            questions: [{ question: 'Q1', averageRisk: 2, position: 1 }],
          },
        ],
      } as unknown as PollAvgReport;

      const result = component.getPollAvgQuestionFromSeries(report, 'Comp1', {
        x: 'Q1',
        y: 2,
        position: 2,
      } as SummarySerie);
      expect(result).toBeNull();
    });
  });

  describe('toggleChart', () => {
    it('should toggle heatmapChart flag correctly', () => {
      component.heatmapChart = false;
      component.toggleChart('heatmap');
      expect(component.heatmapChart).toBeTrue();

      component.toggleChart('bar');
      expect(component.heatmapChart).toBeFalse();
    });
  });

  describe('loadAllStudents & onExportRequested & onExporting', () => {
    it('should load all students recursively across pages', async () => {
      studentServiceSpy.getAllAverageByCohortsAndPoll.and.returnValues(
        of({
          items: [{ studentId: 1 }],
          count: 2,
        } as unknown as StudentsResponse),
        of({
          items: [{ studentId: 2 }],
          count: 2,
        } as unknown as StudentsResponse)
      );

      component.cohortIds = [1];
      component.pollUuid = 'uuid';

      await component.loadAllStudents();

      expect(component.allStudents.length).toBe(2);
      expect(
        studentServiceSpy.getAllAverageByCohortsAndPoll
      ).toHaveBeenCalledTimes(2);
    });

    it('should resolve immediately when first page already returns all items', async () => {
      studentServiceSpy.getAllAverageByCohortsAndPoll.and.returnValue(
        of({
          items: [{ studentId: 1 }],
          count: 1,
        } as unknown as StudentsResponse)
      );
      component.cohortIds = [1];
      component.pollUuid = 'uuid';

      await component.loadAllStudents();

      expect(component.allStudents.length).toBe(1);
      expect(
        studentServiceSpy.getAllAverageByCohortsAndPoll
      ).toHaveBeenCalledTimes(1);
    });

    it('should call loadAllStudents if not already loaded in onExportRequested', async () => {
      spyOn(component, 'loadAllStudents').and.resolveTo();

      await component.onExportRequested('csv' as TypeFile);
      expect(component.loadAllStudents).toHaveBeenCalled();

      (component.loadAllStudents as jasmine.Spy).calls.reset();
      await component.onExportRequested('csv' as TypeFile);
      expect(component.loadAllStudents).not.toHaveBeenCalled();
    });

    it('should update isExporting signal onExporting', async () => {
      await component.onExporting(true);
      expect(component.isExporting()).toBeTrue();

      await component.onExporting(false);
      expect(component.isExporting()).toBeFalse();
    });
  });

  describe('showEmpty', () => {
    it('should be true when pollUuid is empty', () => {
      component.pollUuid = '';
      expect(component.showEmpty).toBeTrue();
    });

    it('should be false when pollUuid exists', () => {
      component.pollUuid = 'poll-123';
      expect(component.showEmpty).toBeFalse();
    });
  });
});
