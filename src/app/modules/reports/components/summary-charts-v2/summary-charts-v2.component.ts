import { CommonModule } from '@angular/common';
import {
  Component,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

import { CohortModel } from '@core/models/cohort.model';
import { Column } from '@shared/components/list/types/column';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { EventLoad } from '@core/models/load';
import { Filter } from '../poll-filters/types/filters';
import { GetChartOptions } from '@core/utils/apex-chart/heat-map-config';
import { MatDialog } from '@angular/material/dialog';
import { PollAvgQuestion, PollAvgReport } from '@core/models/summary.model';
import { StudentRiskAverage } from '@core/services/interfaces/student.interface';
import { SummarySerie } from '@core/models/heatmap-data.model';

import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { ReportService } from '@core/services/api/report.service';
import { StudentService } from '@core/services/api/student.service';

import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import {
  ListComponent,
  TypeFile,
} from '@shared/components/list/list.component';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '@shared/components/modals/modal-question-details/modal-question-details.component';
import { PollFiltersComponent } from '../poll-filters/poll-filters.component';
import { SummaryColumnChartsComponent } from '@modules/reports/components/summary-charts/summary-column-charts/summary-column-charts.component';
import { TooltipChartComponent } from '../tooltip-chart/tooltip-chart.component';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-students-risk',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatTableModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgApexchartsModule,
    EmptyDataComponent,
    ListComponent,
    CommonModule,
    PollFiltersComponent,
    MatMenuModule,
    SummaryColumnChartsComponent,
    MatProgressSpinner,
  ],
  templateUrl: './summary-charts-v2.component.html',
  styleUrl: './summary-charts-v2.component.scss',
})
export class SummaryChartsV2Component {
  studentService = inject(StudentService);
  pdfHelper = inject(PdfHelper);
  reportService = inject(ReportService);
  private readonly dialog = inject(MatDialog);
  private injector = inject(EnvironmentInjector);
  hasNoResults = false;
  private featureFlagsService = inject(FeatureFlagsService);
  isExpanded = false;

  @ViewChild('contentToExport') contentToExport!: ElementRef;

  chartOptions: ApexOptions = {};

  columns: Column<StudentRiskAverage>[] = [
    {
      key: 'studentName',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
  ];

  columnTemplates: Column<StudentRiskAverage>[] = [
    {
      key: 'avgRiskLevel',
      label: 'Average Risk',
      isTemplate: true,
    },
  ];
  variableColumns = ['variableName'];

  cohortIds: number[] = [];

  selectedCohort?: CohortModel;
  lastVersion = true;
  pollUuid = '';
  evaluationId?: number | string;

  students: StudentRiskAverage[] = [];
  allStudents: StudentRiskAverage[] = [];
  totalStudents = 0;

  isLoading = false;
  isGeneratingPDF = false;
  isExporting = signal<boolean>(false);
  title = '';
  components = signal<PollAvgReport | null>(null);
  heatmapChart = true;
  private allStudentsLoaded = false;

  constructor(private snackBar: MatSnackBar) {}

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  get isV2Enabled(): boolean {
    return this.featureFlagsService.isEnabled(FEATURE_FLAGS.reportsV2);
  }

  getRiskColor(value: number): string {
    if (value < 0) return '#BDBDBD';
    if (value < 1) return '#BDBDBD';
    if (value < 2) return '#43A047';
    if (value < 3) return '#66BB6A';
    if (value < 4) return '#FDD835';
    if (value < 5) return '#FFB74D';
    return '#EF5350';
  }

  getStudentsByCohortAndPoll(event: EventLoad) {
    this._loadStudents(event);
  }

  getHeatMap() {
    if (!this.pollUuid || !this.cohortIds.length) {
      this.chartOptions = {};
      this.isLoading = false;
      return;
    }

    this.reportService
      .getAvgPoolReport(
        this.pollUuid,
        this.cohortIds,
        this.lastVersion,
        this.evaluationId
      )
      .subscribe({
        next: response => {
          this.components.set(response.body);
          this.hasNoResults = !response.body?.components?.length;

          const reportSeries = this.reportService.getHMSeriesFromAvgReport(
            response.body
          );
          const series = this.reportService.regroupSummaryByColor(reportSeries);

          this.chartOptions = GetChartOptions(
            '',
            series,
            (x, y) => {
              const component = series[y];
              const serieQuestion = series[y].data[x];
              const pollAvgQuestion = this.getPollAvgQuestionFromSeries(
                response.body,
                component.description,
                serieQuestion
              );
              if (!pollAvgQuestion) {
                console.error('Error getting question from report.');
              } else {
                this.openDetailsModal(
                  pollAvgQuestion,
                  component.description as ComponentValueType,
                  component.text
                );
              }
            },
            { legend: { show: false } },
            (x, y) => {
              const category = `Q: ${series[x].data[y].x}`;
              const value = `Answer: ${series[x].data[y].y}`;
              const answers = series[x].data[y].z;

              const compRef = createComponent(TooltipChartComponent, {
                environmentInjector: this.injector,
              });

              compRef.instance.value = value;
              compRef.instance.category = category;
              compRef.instance.answers = answers;

              const container = document.createElement('div');
              container.appendChild(compRef.location.nativeElement);
              compRef.changeDetectorRef.detectChanges();

              const html = container.innerHTML;
              compRef.destroy();

              return html;
            }
          );
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.hasNoResults = true;
        },
      });
  }

  getPollAvgQuestionFromSeries(
    report: PollAvgReport,
    componentName: string,
    serieQuestion: SummarySerie
  ): PollAvgQuestion | null {
    const reportComponent = report.components.find(c =>
      componentName.includes(c.description)
    );
    const question = reportComponent?.questions.find(
      question =>
        question.question === serieQuestion.x &&
        question.averageRisk === serieQuestion.y &&
        (question.position === undefined ||
          question.position === serieQuestion.position)
    );

    return question ?? null;
  }

  async exportReportPdf() {
    if (this.isGeneratingPDF) return;
    this.isGeneratingPDF = true;

    await new Promise(resolve => setTimeout(resolve, 300));

    await this.pdfHelper.exportToPdf({
      fileName: 'cohort_report',
      container: this.contentToExport,
      snackBar: this.snackBar,
    });

    this.isGeneratingPDF = false;
  }

  openDetailsModal(
    question: PollAvgQuestion,
    componentName: ComponentValueType,
    text?: string
  ): void {
    if (!this.pollUuid) return;
    const data: SelectedHMData = {
      cohortId: this.cohortIds.join(','),
      pollUuid: this.pollUuid,
      componentName,
      text: text ?? componentName,
      question,
      evaluationId: this.evaluationId,
    };
    this.dialog.open(ModalQuestionDetailsComponent, { data });
  }

  handleFilterSelect(filters: Filter) {
    this.hasNoResults = false;
    this.cohortIds = filters.cohortIds;
    this.title = filters.title;
    this.pollUuid = filters.uuid;
    this.lastVersion = filters.lastVersion;
    this.evaluationId = filters.evaluationId;

    if (!filters.uuid || !filters.cohortIds?.length) {
      this.chartOptions = {};
      this.students = [];
      return;
    }

    this.isLoading = true;
    this._loadStudents({ pageSize: 10, page: 0 });
    this.getHeatMap();
  }

  toggleChart(chart: string) {
    this.heatmapChart = chart === 'heatmap';
  }

  loadAllStudents(): Promise<void> {
    return new Promise(resolve => {
      const batchPageSize = 100;
      let page = 0;
      let allItems: StudentRiskAverage[] = [];

      const fetchPage = () => {
        this.studentService
          .getAllAverageByCohortsAndPoll({
            page,
            pageSize: batchPageSize,
            cohortIds: this.cohortIds,
            pollUuid: this.pollUuid,
            lastVersion: this.lastVersion,
            evaluationId: this.evaluationId,
          })
          .subscribe(response => {
            allItems = [...allItems, ...response.items];
            if (allItems.length < response.count) {
              page++;
              fetchPage();
            } else {
              this.allStudents = allItems;
              resolve();
            }
          });
      };

      fetchPage();
    });
  }

  async onExportRequested(event: TypeFile) {
    void event;
    if (!this.allStudentsLoaded) {
      await this.loadAllStudents();
      this.allStudentsLoaded = true;
    }
  }

  async onExporting(processExport: boolean) {
    this.isExporting.set(processExport);
  }

  get showEmpty(): boolean {
    return !this.pollUuid;
  }

  private _loadStudents(event: EventLoad) {
    if (this.cohortIds.length && this.pollUuid) {
      this.studentService
        .getAllAverageByCohortsAndPoll({
          page: event.page,
          pageSize: event.pageSize,
          cohortIds: this.cohortIds,
          pollUuid: this.pollUuid,
          lastVersion: this.lastVersion,
          evaluationId: this.evaluationId,
        })
        .subscribe({
          next: response => {
            this.students = response.items;
            this.totalStudents = response.count;
            this.hasNoResults =
              response.count === 0 && !this.components()?.components?.length;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
    } else {
      this.students = [];
      this.totalStudents = 0;
      this.isLoading = false;
    }
  }
}
