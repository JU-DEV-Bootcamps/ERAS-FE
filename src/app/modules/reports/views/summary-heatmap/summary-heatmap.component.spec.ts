import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryHeatmapComponent } from './summary-heatmap.component';
import { StudentService } from '../../../../core/services/api/student.service';
import { ReportService } from '../../../../core/services/api/report.service';
import { PdfService } from '../../../../core/services/exports/pdf.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import {
  GetQueryResponse,
  PollAvgQuestion,
  PollAvgReport,
} from '../../../../core/models/summary.model';
import { CohortModel } from '../../../../core/models/cohort.model';
import { SummarySerie } from '../../../../core/models/heatmap-data.model';
import { Filter } from '../../components/poll-filters/types/filters';
import { StudentRiskAverage } from '../../../../core/services/interfaces/student.interface';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PdfHelper } from '../../exportReport.util';
import { PagedResult } from '../../../../core/services/interfaces/page.type';
import { ComponentValueType } from '../../../../features/heat-map/types/risk-students-detail.type';

describe('SummaryHeatmapComponent', () => {
  let component: SummaryHeatmapComponent;
  let fixture: ComponentFixture<SummaryHeatmapComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let pdfHelperSpy: jasmine.SpyObj<PdfHelper>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;
  let pdfServiceSpy: jasmine.SpyObj<PdfService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    studentServiceSpy = jasmine.createSpyObj('StudentService', [
      'getAllAverageByCohortsAndPoll',
    ]);
    pdfHelperSpy = jasmine.createSpyObj('PdfHelper', ['exportToPdf']);
    reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getAvgPoolReport',
      'getHMSeriesFromAvgReport',
      'regroupSummaryByColor',
    ]);
    pdfServiceSpy = jasmine.createSpyObj('PdfService', ['exportToPDF']);
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SummaryHeatmapComponent,
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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
    });
    expect(component.students).toEqual(mockStudents.items);
    expect(component.totalStudents).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('should call getAvgPoolReport and set chartOptions in getHeatMap', () => {
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
    component.getHeatMap();

    expect(reportServiceSpy.getAvgPoolReport).toHaveBeenCalledWith(
      'poll-uuid',
      [],
      true
    );
    expect(component.chartOptions).toBeDefined();
  });

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

  it('should call exportToPDF when exportReportPdf is called', async () => {
    const fakeElement = document.createElement('div');
    component.contentToExport = new ElementRef(fakeElement);
    spyOn(document.body, 'appendChild').and.callThrough();
    spyOn(document.body, 'removeChild').and.callThrough();
    await component.exportReportPdf();
  });

  it('should update filters and call getStudentsByCohortAndPoll and getHeatMap on handleFilterSelect', () => {
    spyOn(component, 'getStudentsByCohortAndPoll');
    spyOn(component, 'getHeatMap');
    const filters = { cohortIds: [1], title: 'Test', uuid: 'poll-uuid' };
    component.handleFilterSelect(filters as Filter);
    expect(component.cohortIds).toEqual([1]);
    expect(component.title).toBe('Test');
    expect(component.pollUuid).toBe('poll-uuid');
    expect(component.getStudentsByCohortAndPoll).toHaveBeenCalled();
    expect(component.getHeatMap).toHaveBeenCalled();
  });

  it('should return null if getPollAvgQuestionFromSeries does not find a match', () => {
    const report = { components: [{ description: 'desc', questions: [] }] };
    const result = component.getPollAvgQuestionFromSeries(
      report as unknown as PollAvgReport,
      'desc',
      { x: 'Q', y: 1 } as SummarySerie
    );
    expect(result).toBeNull();
  });
});
