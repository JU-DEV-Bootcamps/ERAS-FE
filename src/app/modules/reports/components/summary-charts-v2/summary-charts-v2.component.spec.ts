import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { SummaryChartsV2Component } from './summary-charts-v2.component';
import { StudentService } from '@core/services/api/student.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { ReportService } from '@core/services/api/report.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import {
  AnswerDetail,
  GetQueryResponse,
  PollAvgComponent,
  PollAvgQuestion,
  PollAvgReport,
} from '@core/models/summary.model';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ColumnRiskPanelData } from './column-risk-panel/column-risk-panel.component';
import { DetailsPanelData } from '@shared/components/panels/details-panel-v2/details-panel.component';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';

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

describe('SummaryChartsV2Component', () => {
  let component: SummaryChartsV2Component;
  let fixture: ComponentFixture<SummaryChartsV2Component>;

  let studentService: jasmine.SpyObj<StudentService>;
  let pdfHelper: jasmine.SpyObj<PdfHelper>;
  let reportService: jasmine.SpyObj<ReportService>;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    studentService = jasmine.createSpyObj<StudentService>('StudentService', [
      'getAllAverageByCohortsAndPoll',
    ]);
    pdfHelper = jasmine.createSpyObj<PdfHelper>('PdfHelper', ['exportToPdf']);
    reportService = jasmine.createSpyObj<ReportService>('ReportService', [
      'getAvgPoolReport',
      'getHMSeriesFromAvgReport',
      'regroupSummaryByColor',
    ]);
    featureFlagsService = jasmine.createSpyObj<FeatureFlagsService>(
      'FeatureFlagsService',
      ['isEnabled']
    );

    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [SummaryChartsV2Component],
      providers: [
        { provide: StudentService, useValue: studentService },
        { provide: PdfHelper, useValue: pdfHelper },
        { provide: ReportService, useValue: reportService },
        { provide: FeatureFlagsService, useValue: featureFlagsService },
        { provide: MatSnackBar, useValue: snackBar },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open']),
        },
        provideHttpClient(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryChartsV2Component);
    component = fixture.componentInstance;
  });

  describe('columns and columnTemplates', () => {
    it('should define table columns and templates correctly', () => {
      expect(component.columns.length).toBe(2);
      expect(component.columns[0].key).toBe('studentName');
      expect(component.columns[1].key).toBe('email');

      expect(component.columnTemplates.length).toBe(1);
      expect(component.columnTemplates[0].key).toBe('avgRiskLevel');
      expect(component.columnTemplates[0].isTemplate).toBeTrue();
    });
  });

  describe('getRiskColor', () => {
    it('should cover all risk color branches', () => {
      expect(component.getRiskColor(-1)).toBe('#BDBDBD');
      expect(component.getRiskColor(0)).toBe('#BDBDBD');
      expect(component.getRiskColor(1)).toBe('#43A047');
      expect(component.getRiskColor(2)).toBe('#66BB6A');
      expect(component.getRiskColor(3)).toBe('#FDD835');
      expect(component.getRiskColor(4)).toBe('#FFB74D');
      expect(component.getRiskColor(5)).toBe('#EF5350');
    });
  });

  describe('toggleExpand', () => {
    it('should return the isExpanded value', () => {
      component.isExpanded = true;
      component.toggleExpand();
      expect(component.isExpanded).toBeFalse();
    });
  });

  describe('isV2Enabled', () => {
    it('should return the feature flag value', () => {
      featureFlagsService.isEnabled.and.returnValue(true);
      expect(component.isV2Enabled).toBeTrue();
      featureFlagsService.isEnabled.and.returnValue(false);
      expect(component.isV2Enabled).toBeFalse();
    });
  });

  describe('getHeatMap', () => {
    it('should return early when pollUuid is missing', () => {
      component.pollUuid = '';
      component.cohortIds = [1];
      component.isLoading = true;
      component.getHeatMap();
      expect(component.chartOptions).toEqual({});
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAvgPoolReport).not.toHaveBeenCalled();
    });

    it('should return early when cohortIds is empty', () => {
      component.pollUuid = 'poll-1';
      component.cohortIds = [];
      component.isLoading = true;
      component.getHeatMap();
      expect(component.chartOptions).toEqual({});
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAvgPoolReport).not.toHaveBeenCalled();
    });

    it('should handle report success with empty components', () => {
      const response = {
        status: '200',
        body: {
          components: [],
          pollCount: 10,
        },
      };

      reportService.getAvgPoolReport.and.returnValue(
        of(response as unknown as GetQueryResponse<PollAvgReport>)
      );
      reportService.getHMSeriesFromAvgReport.and.returnValue([]);
      reportService.regroupSummaryByColor.and.returnValue([]);

      component.pollUuid = 'poll-1';
      component.cohortIds = [1];
      component.isLoading = true;
      component.getHeatMap();

      expect(component.components()).toEqual(response.body);
      expect(component.hasNoResults).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });

    it('should handle report success with components present', () => {
      const response = {
        status: '200',
        body: {
          components: [
            {
              description: 'academico',
              averageRisk: 2,
              questions: [],
            },
          ],
          pollCount: 10,
        },
      };

      reportService.getAvgPoolReport.and.returnValue(
        of(response as unknown as GetQueryResponse<PollAvgReport>)
      );
      reportService.getHMSeriesFromAvgReport.and.returnValue([]);
      reportService.regroupSummaryByColor.and.returnValue([]);

      component.pollUuid = 'poll-1';
      component.cohortIds = [1];
      component.isLoading = true;
      component.getHeatMap();

      expect(component.hasNoResults).toBeFalse();
    });

    it('should trigger dataPointSelection from chartOptions and open details panel if question exists', fakeAsync(() => {
      const mockQuestion = {
        question: 'Q1',
        averageRisk: 2,
        position: 0,
        answersDetails: [],
      } as unknown as PollAvgQuestion;

      const response = {
        status: '200',
        body: {
          components: [
            {
              description: 'academico',
              text: 'Academico',
              questions: [mockQuestion],
            },
          ],
          pollCount: 10,
        },
      };
      const mockSeries = [
        {
          description: 'academico',
          text: 'Academico',
          data: [{ x: 'Q1', y: 2, position: 0 }],
        },
      ];

      reportService.getAvgPoolReport.and.returnValue(
        of(response as unknown as GetQueryResponse<PollAvgReport>)
      );
      reportService.getHMSeriesFromAvgReport.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['getHMSeriesFromAvgReport']
        >
      );
      reportService.regroupSummaryByColor.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['regroupSummaryByColor']
        >
      );

      component.pollUuid = 'poll-1';
      component.cohortIds = [1];
      component.getHeatMap();

      const clickHandler =
        component.chartOptions.chart?.events?.dataPointSelection;
      if (clickHandler) {
        spyOn(component, 'openDetailsPanel');
        (clickHandler as unknown as ChartClickFn)({}, undefined, {
          dataPointIndex: 0,
          seriesIndex: 0,
        });
        expect(component.openDetailsPanel).toHaveBeenCalledWith(
          mockQuestion,
          'academico' as ComponentValueType,
          'Academico'
        );
      }
      tick(50);
    }));

    it('should log error if question is not found when dataPointSelection is triggered', fakeAsync(() => {
      const response = {
        status: '200',
        body: {
          components: [
            {
              description: 'academico',
              text: 'Academico',
              questions: [],
            },
          ],
          pollCount: 10,
        },
      };
      const mockSeries = [
        {
          description: 'academico',
          text: 'Academico',
          data: [{ x: 'Q1', y: 2, position: 0 }],
        },
      ];

      reportService.getAvgPoolReport.and.returnValue(
        of(response as unknown as GetQueryResponse<PollAvgReport>)
      );
      reportService.getHMSeriesFromAvgReport.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['getHMSeriesFromAvgReport']
        >
      );
      reportService.regroupSummaryByColor.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['regroupSummaryByColor']
        >
      );

      component.pollUuid = 'poll-1';
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
      tick(50);
    }));

    it('should execute custom tooltip callback from chartOptions', () => {
      const response = {
        status: '200',
        body: {
          components: [],
          pollCount: 10,
        },
      };
      const mockSeries = [
        {
          description: 'academico',
          data: [{ x: 'Cat1', y: 2, z: [] }],
        },
      ];

      reportService.getAvgPoolReport.and.returnValue(
        of(response as unknown as GetQueryResponse<PollAvgReport>)
      );
      reportService.getHMSeriesFromAvgReport.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['getHMSeriesFromAvgReport']
        >
      );
      reportService.regroupSummaryByColor.and.returnValue(
        mockSeries as unknown as ReturnType<
          ReportService['regroupSummaryByColor']
        >
      );

      component.pollUuid = 'poll-1';
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

    it('should handle report error', () => {
      reportService.getAvgPoolReport.and.returnValue(
        throwError(() => new Error('error'))
      );
      component.pollUuid = 'poll-1';
      component.cohortIds = [1];
      component.isLoading = true;
      component.getHeatMap();

      expect(component.isLoading).toBeFalse();
      expect(component.hasNoResults).toBeTrue();
    });
  });

  describe('getPollAvgQuestionFromSeries', () => {
    let question: {
      question: string;
      averageRisk: number;
      position: number;
      averageAnswer: string;
      answersDetails: AnswerDetail[];
    };
    beforeEach(async () => {
      question = {
        question: 'Question 1',
        averageRisk: 3,
        position: 2,
        averageAnswer: 'Response 1',
        answersDetails: [
          {
            answerText: 'string',
            answerPercentage: 2,
            studentsEmails: ['email'],
          },
        ],
      };
    });

    it('should return question when a match is found', () => {
      const report: { pollCount: number; components: PollAvgComponent[] } = {
        pollCount: 1,
        components: [
          {
            description: 'academico',
            averageRisk: 2,
            questions: [question],
          },
        ],
      };

      const result = component.getPollAvgQuestionFromSeries(
        report,
        'academico',
        {
          x: 'Question 1',
          y: 3,
          z: [],
          position: 2,
        }
      );
      expect(result).toEqual(question);
    });

    it('should return null when component is not found in report', () => {
      const report: { pollCount: number; components: PollAvgComponent[] } = {
        pollCount: 1,
        components: [
          {
            description: 'academico',
            averageRisk: 2,
            questions: [question],
          },
        ],
      };

      const result = component.getPollAvgQuestionFromSeries(report, 'salud', {
        x: 'Question 1',
        y: 3,
        z: [],
        position: 2,
      });
      expect(result).toBeNull();
    });

    it('should match question when question.position is undefined', () => {
      const questionWithoutPosition = {
        ...question,
        position: undefined as unknown as number,
      };
      const report: { pollCount: number; components: PollAvgComponent[] } = {
        pollCount: 1,
        components: [
          {
            description: 'academico',
            averageRisk: 2,
            questions: [questionWithoutPosition],
          },
        ],
      };

      const result = component.getPollAvgQuestionFromSeries(
        report,
        'academico',
        {
          x: 'Question 1',
          y: 3,
          z: [],
          position: 99,
        }
      );
      expect(result).toEqual(questionWithoutPosition);
    });

    it('should return null when question does not match', () => {
      const report: { pollCount: number; components: PollAvgComponent[] } = {
        pollCount: 1,
        components: [
          {
            description: 'academico',
            averageRisk: 2,
            questions: [question],
          },
        ],
      };

      const result = component.getPollAvgQuestionFromSeries(
        report,
        'academico',
        {
          x: 'Question 2',
          y: 2,
          z: [
            {
              answerText: 'string',
              answerPercentage: 2,
              studentsEmails: ['email'],
            },
          ],
          position: 1,
        }
      );
      expect(result).toBeNull();
    });
  });

  describe('exportReportPdf', () => {
    it('should return immediately when PDF generation is already running', async () => {
      component.isGeneratingPDF = true;
      await component.exportReportPdf();
      expect(pdfHelper.exportToPdf).not.toHaveBeenCalled();
    });

    it('should export PDF and reset generating state', fakeAsync(() => {
      pdfHelper.exportToPdf.and.resolveTo();
      component.contentToExport = {
        nativeElement: document.createElement('div'),
      };
      const promise = component.exportReportPdf();
      expect(component.isGeneratingPDF).toBeTrue();
      tick(300);
      expect(pdfHelper.exportToPdf).toHaveBeenCalledWith({
        fileName: 'cohort_report',
        container: component.contentToExport,
        snackBar,
      });
      expect(component.isGeneratingPDF).toBeFalse();
      void promise;
    }));
  });

  describe('openDetailsPanel', () => {
    it('should return when pollUuid is missing', () => {
      component.pollUuid = '';
      component.openDetailsPanel(
        {
          question: 'Question',
          averageRisk: 2,
          position: 1,
          averageAnswer: 'gift',
          answersDetails: [
            {
              answerText: 'string',
              answerPercentage: 2,
              studentsEmails: ['email'],
            },
          ],
        },
        'academico'
      );
      expect(component.isPanelOpen()).toBeFalse();
      expect(component.selectedPanelData()).toBeNull();
    });

    it('should fallback to componentName when text is not provided', fakeAsync(() => {
      component.pollUuid = 'poll-1';
      component.cohortIds = [1, 2];
      component.evaluationId = 10;
      component.openDetailsPanel(
        {
          question: 'Question',
          averageRisk: 2,
          position: 1,
          averageAnswer: 'gift',
          answersDetails: [],
        },
        'academico'
      );

      expect(component.selectedPanelData()).toEqual({
        cohortId: '1,2',
        pollUuid: 'poll-1',
        componentName: 'academico',
        text: 'academico',
        question: jasmine.objectContaining({ question: 'Question' }),
        evaluationId: 10,
      });
      expect(component.isPanelOpen()).toBeTrue();
      tick(50);
    }));

    it('should use provided text', fakeAsync(() => {
      component.pollUuid = 'poll-1';
      component.cohortIds = [1];
      component.openDetailsPanel(
        {
          question: 'Question',
          averageRisk: 2,
          position: 1,
          averageAnswer: 'gift',
          answersDetails: [
            {
              answerText: 'string',
              answerPercentage: 2,
              studentsEmails: ['email'],
            },
          ],
        },
        'academico',
        'Custom text'
      );
      expect(component.selectedPanelData()?.text).toBe('Custom text');
      tick(50);
    }));
  });

  describe('closePanel', () => {
    it('should close the panel and clear selected data', fakeAsync(() => {
      component.isPanelOpen.set(true);
      component.selectedPanelData.set({} as unknown as DetailsPanelData);

      component.closePanel();

      expect(component.isPanelOpen()).toBeFalse();
      expect(component.selectedPanelData()).toBeNull();
      tick(50);
    }));
  });

  describe('handleFilterSelect', () => {
    it('should return early when filter has no uuid', () => {
      component.handleFilterSelect({
        uuid: '',
        cohortIds: [1],
        variableIds: [1],
        title: 'Title',
        lastVersion: true,
        selectedComponents: ['individual'],
      });

      expect(component.chartOptions).toEqual({});
      expect(component.students).toEqual([]);
      expect(
        studentService.getAllAverageByCohortsAndPoll
      ).not.toHaveBeenCalled();
      expect(reportService.getAvgPoolReport).not.toHaveBeenCalled();
    });

    it('should return early when filter has no cohorts', () => {
      component.handleFilterSelect({
        uuid: 'poll-1',
        cohortIds: [],
        variableIds: [],
        title: 'Title',
        lastVersion: true,
        selectedComponents: [],
      });

      expect(component.chartOptions).toEqual({});
      expect(component.students).toEqual([]);
    });

    it('should call closePanel, update metadata and load students/heatmap for valid filters', () => {
      spyOn(component, 'closePanel');
      studentService.getAllAverageByCohortsAndPoll.and.returnValue(
        of({
          items: [],
          count: 0,
        })
      );
      reportService.getAvgPoolReport.and.returnValue(
        of({
          status: '200',
          body: {
            components: [],
            pollCount: 0,
          },
        })
      );

      reportService.getHMSeriesFromAvgReport.and.returnValue([]);
      reportService.regroupSummaryByColor.and.returnValue([]);

      component.handleFilterSelect({
        title: 'Title',
        uuid: 'poll-1',
        cohortIds: [1],
        variableIds: [1],
        lastVersion: false,
        evaluationId: 88,
        selectedComponents: ['academico'],
      });

      expect(component.closePanel).toHaveBeenCalled();
      expect(component.title).toBe('Title');
      expect(component.pollUuid).toBe('poll-1');
      expect(component.cohortIds).toEqual([1]);
      expect(component.lastVersion).toBeFalse();
      expect(component.evaluationId).toBe(88);
      expect(component.isLoading).toBeFalse();
      expect(studentService.getAllAverageByCohortsAndPoll).toHaveBeenCalled();
      expect(reportService.getAvgPoolReport).toHaveBeenCalled();
    });
  });

  describe('toggleChart', () => {
    it('should set heatmap when chart is heatmap and close panels', () => {
      component.isPanelOpen.set(true);
      component.selectedPanelData.set({} as unknown as DetailsPanelData);
      component.isColumnPanelOpen.set(true);
      component.selectedColumnPanelData.set(
        {} as unknown as ColumnRiskPanelData
      );

      component.toggleChart('heatmap');

      expect(component.heatmapChart).toBeTrue();
      expect(component.isPanelOpen()).toBeFalse();
      expect(component.selectedPanelData()).toBeNull();
      expect(component.isColumnPanelOpen()).toBeFalse();
      expect(component.selectedColumnPanelData()).toBeNull();
    });

    it('should set heatmap to false for another chart', () => {
      component.toggleChart('column');

      expect(component.heatmapChart).toBeFalse();
    });
  });

  describe('loadAllStudents', () => {
    it('should resolve when all students are loaded in one request', async () => {
      studentService.getAllAverageByCohortsAndPoll.and.returnValue(
        of({
          items: [
            {
              studentName: 'Student 1',
              studentId: 1,
              email: 'stu@mail.com',
              avgRiskLevel: 3,
            },
          ],
          count: 1,
        })
      );
      component.cohortIds = [1];
      component.pollUuid = 'poll-1';
      await component.loadAllStudents();

      expect(component.allStudents.length).toBe(1);
      expect(
        studentService.getAllAverageByCohortsAndPoll
      ).toHaveBeenCalledTimes(1);
    });

    it('should load multiple pages when count is greater than items', async () => {
      studentService.getAllAverageByCohortsAndPoll.and.returnValues(
        of({
          items: [
            {
              studentName: 'Student 1',
              studentId: 1,
              email: 'stu@mail.com',
              avgRiskLevel: 3,
            },
          ],
          count: 2,
        }),
        of({
          items: [
            {
              studentName: 'Student 2',
              studentId: 2,
              email: 'stu2@mail.com',
              avgRiskLevel: 3,
            },
          ],
          count: 2,
        })
      );

      component.cohortIds = [1];
      component.pollUuid = 'poll-1';

      await component.loadAllStudents();

      expect(component.allStudents.length).toBe(2);
      expect(
        studentService.getAllAverageByCohortsAndPoll
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe('onExportRequested', () => {
    it('should load students when they have not been loaded', async () => {
      spyOn(component, 'loadAllStudents').and.resolveTo();
      await component.onExportRequested('pdf');
      expect(component.loadAllStudents).toHaveBeenCalled();
    });

    it('should not load students again when already loaded', async () => {
      component['allStudentsLoaded'] = true;
      spyOn(component, 'loadAllStudents').and.resolveTo();
      await component.onExportRequested('pdf');
      expect(component.loadAllStudents).not.toHaveBeenCalled();
    });
  });

  describe('_loadStudents through getStudentsByCohortAndPoll', () => {
    it('should clear students when cohort or poll is missing', () => {
      component.cohortIds = [];
      component.pollUuid = '';

      component.students = [
        {
          studentName: 'Student',
          studentId: 2,
          email: 'stu@mail.com',
          avgRiskLevel: 3,
        },
      ];
      component.totalStudents = 10;
      component.isLoading = true;
      component.getStudentsByCohortAndPoll({
        page: 0,
        pageSize: 10,
      });

      expect(component.students).toEqual([]);
      expect(component.totalStudents).toBe(0);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle successful student loading with results', () => {
      studentService.getAllAverageByCohortsAndPoll.and.returnValue(
        of({
          items: [
            {
              studentName: 'Student',
              studentId: 1,
              email: 'stu@mail.com',
              avgRiskLevel: 3,
            },
          ],
          count: 1,
        })
      );

      component.cohortIds = [1];
      component.pollUuid = 'poll-1';
      component.isLoading = true;

      component.getStudentsByCohortAndPoll({
        page: 0,
        pageSize: 10,
      });

      expect(component.students.length).toBe(1);
      expect(component.totalStudents).toBe(1);
      expect(component.hasNoResults).toBeFalse();
      expect(component.isLoading).toBeFalse();
    });

    it('should set no results when response is empty and there are no components', () => {
      studentService.getAllAverageByCohortsAndPoll.and.returnValue(
        of({
          items: [],
          count: 0,
        })
      );

      component.cohortIds = [1];
      component.pollUuid = 'poll-1';
      component.components.set(null);
      component.getStudentsByCohortAndPoll({
        page: 0,
        pageSize: 10,
      });
      expect(component.hasNoResults).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });

    it('should set hasNoResults to false when count is 0 but components are present', () => {
      studentService.getAllAverageByCohortsAndPoll.and.returnValue(
        of({
          items: [],
          count: 0,
        })
      );

      component.cohortIds = [1];
      component.pollUuid = 'poll-1';
      component.components.set({
        components: [
          { description: 'academico' },
        ] as unknown as PollAvgComponent[],
        pollCount: 1,
      });

      component.getStudentsByCohortAndPoll({
        page: 0,
        pageSize: 10,
      });

      expect(component.hasNoResults).toBeFalse();
      expect(component.isLoading).toBeFalse();
    });

    it('should handle student loading error', () => {
      studentService.getAllAverageByCohortsAndPoll.and.returnValue(
        throwError(() => new Error('error'))
      );
      component.cohortIds = [1];
      component.pollUuid = 'poll-1';
      component.isLoading = true;
      component.getStudentsByCohortAndPoll({
        page: 0,
        pageSize: 10,
      });
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('showEmpty', () => {
    it('should be true when pollUuid is empty', () => {
      component.pollUuid = '';

      expect(component.showEmpty).toBeTrue();
    });

    it('should be false when pollUuid exists', () => {
      component.pollUuid = 'poll-1';

      expect(component.showEmpty).toBeFalse();
    });
  });

  describe('openPanelFromColumn', () => {
    it('should open the column panel and close the details panel', fakeAsync(() => {
      const data = {
        studentName: 'John Doe',
        riskLevel: 3,
        cohortIds: [1],
        pollUuid: '123',
        componentName: 'academico' as ComponentValueType,
        title: 'Title',
        questions: [],
      } as unknown as ColumnRiskPanelData;

      component.isPanelOpen.set(true);
      component.selectedPanelData.set({} as unknown as DetailsPanelData);

      component.openPanelFromColumn(data);

      expect(component.selectedColumnPanelData()).toBe(data);
      expect(component.isColumnPanelOpen()).toBeTrue();
      expect(component.isPanelOpen()).toBeFalse();
      expect(component.selectedPanelData()).toBeNull();
      tick(50);
    }));
  });

  describe('closeColumnPanel', () => {
    it('should close the column panel and clear selected data', fakeAsync(() => {
      component.isColumnPanelOpen.set(true);
      component.selectedColumnPanelData.set(
        {} as unknown as ColumnRiskPanelData
      );
      component.closeColumnPanel();
      expect(component.isColumnPanelOpen()).toBeFalse();
      expect(component.selectedColumnPanelData()).toBeNull();
      tick(50);
    }));
  });

  describe('onExporting', () => {
    it('should update isExporting', async () => {
      await component.onExporting(true);
      expect(component.isExporting()).toBeTrue();
      await component.onExporting(false);
      expect(component.isExporting()).toBeFalse();
    });
  });
});
