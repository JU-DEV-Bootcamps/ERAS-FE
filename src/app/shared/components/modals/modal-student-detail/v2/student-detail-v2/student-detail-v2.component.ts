import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper/types';
import { AnswerResponse } from '@core/models/answer-request.model';
import { ComponentsAvgModel } from '@core/models/components-avg.model';
import { PollModel } from '@core/models/poll.model';
import { StudentResponse } from '@core/models/student-request.model';
import { StudentService } from '@core/services/api/student.service';
import { PollService } from '@core/services/api/poll.service';
import { PollInstanceService } from '@core/services/api/poll-instance.service';
import { ListComponent } from '@shared/components/list/list.component';
import { Column } from '@shared/components/list/types/column';
import { EventLoad } from '@core/models/load';
import { Pagination } from '@core/services/interfaces/server.type';
import { PagedResult } from '@core/services/interfaces/page.type';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getRiskColor } from '@core/constants/riskLevel';
import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';

register();

interface SwiperEventTarget extends EventTarget {
  swiper: Swiper;
}

@Component({
  selector: 'app-student-detail-v2',
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatTooltipModule,
    CommonModule,
    ListComponent,
    EmptyDataComponent,
  ],
  templateUrl: './student-detail-v2.component.html',
  styleUrl: './student-detail-v2.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudentDetailV2Component implements OnInit, OnDestroy {
  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;

  studentDetails: StudentResponse = {
    entity: {
      uuid: '',
      name: '',
      email: '',
      studentDetail: {
        studentId: 0,
        enrolledCourses: 0,
        gradedCourses: 0,
        timeDeliveryRate: 0,
        avgScore: 0,
        coursesUnderAvg: 0,
        pureScoreDiff: 0,
        standardScoreDiff: 0,
        lastAccessDays: 0,
        id: 0,
      },
      cohortId: 0,
      id: 0,
      isImported: false,
    },
    message: '',
    success: false,
  };

  studentService = inject(StudentService);
  pdfHelper = inject(PdfHelper);
  pollsService = inject(PollService);
  pollInsService = inject(PollInstanceService);

  selectedPoll = 0;
  studentPolls: PollModel[] = [];
  studentAnswers: AnswerResponse[] = [];
  totalStudentAnswers = 0;
  componentsAvg: ComponentsAvgModel[] = [];
  isGeneratingPDF = false;
  processedPolls = new Set<number>();

  @Input({ required: true }) studentId!: number;

  columns: Column<AnswerResponse>[] = [{ key: 'variable', label: 'Variable' }];

  columnTemplates: Column<AnswerResponse>[] = [
    { key: 'position', label: 'Position' },
    { key: 'component', label: 'Component' },
    { key: 'answer', label: 'Answer' },
    { key: 'score', label: 'Score' },
  ];

  pagination: Pagination = { pageSize: 10, page: 0 };
  totalPolls = 0;

  public chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 240,
      toolbar: { show: false },
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 10,
      style: {
        fontSize: '11px',
        colors: ['#333'],
        fontWeight: 600,
      },
      dropShadow: { enabled: false },
      formatter: (val: number) => (val ? Number(val).toFixed(1) : ''),
    },
    xaxis: {
      min: 0,
      max: 5,
      tickAmount: 5,
      labels: { style: { colors: '#999', fontSize: '10px' }, offsetY: -5 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#666', fontSize: '11px', fontWeight: 500 },
        align: 'left',
        offsetX: -8,
      },
    },
    grid: {
      show: true,
      borderColor: '#f0f0f0',
      padding: { bottom: 0, top: -10 },
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: { enabled: false },
  };

  chartSeriesByPollId: Record<number, ApexAxisChartSeries> = {};

  private destroy$ = new Subject<void>();
  private readonly COMPONENT_ORDER = [
    'socioeconomico',
    'familiar',
    'individual',
    'academico',
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.getStudentDetails(this.studentId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleLoad(studentId: number, event: EventLoad) {
    if (event) {
      this.pagination = { page: event.page, pageSize: event.pageSize };
    }
    if (this.selectedPoll === 0) return;
    this.getStudentAnswersByPoll(studentId, this.selectedPoll);
  }

  getStudentDetails(studentId: number) {
    this.studentService
      .getStudentDetailsById(studentId, this.pagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: StudentResponse) => {
          this.studentDetails = data;
          this.getStudentPolls(studentId);
        },
        error: error => console.error(error),
      });
  }

  getStudentPolls(studentId: number) {
    this.pollsService
      .getPollsByStudentId(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PollModel[]) => {
          this.studentPolls = data;
          data.forEach(poll => {
            if (!this.processedPolls.has(poll.id)) {
              this.processedPolls.add(poll.id);
              this.getComponentsAvg(studentId, poll.id);
            }
          });
          if (this.studentPolls.length > 0) {
            this.selectedPoll = this.studentPolls[0].id;
            this.getStudentAnswersByPoll(studentId, this.selectedPoll);
          }
        },
        error: error => console.error(error),
      });
  }

  getComponentsAvg(studentId: number, pollId: number) {
    this.pollInsService
      .getComponentsRiskByPollForStudent(studentId, pollId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ComponentsAvgModel[]) => {
          this.componentsAvg = [...this.componentsAvg, ...data];
          this.buildChartSeries();
        },
        error: error => console.error(error),
      });
  }

  getStudentAnswersByPoll(studentId: number, pollId: number) {
    if (!pollId || pollId === 0) return;
    this.studentService
      .getStudentAnswersByPoll(studentId, pollId, this.pagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PagedResult<AnswerResponse>) => {
          this.studentAnswers = data.items;
          this.totalStudentAnswers = data.count;
        },
        error: error => console.error(error),
      });
  }

  onSlideChange(event: Event) {
    if (event.target && (event.target as SwiperEventTarget).swiper) {
      const swiperInstance = (event.target as SwiperEventTarget)
        .swiper as Swiper;
      const activeIndex = swiperInstance.activeIndex;
      if (this.studentPolls[activeIndex]) {
        const pollId = this.studentPolls[activeIndex].id;
        this.selectedPoll = pollId;
        this.getStudentAnswersByPoll(this.studentId, pollId);
      } else {
        this.studentAnswers = [];
      }
    }
  }

  buildChartSeries() {
    const groupedByPoll: Record<
      number,
      { x: string; y: number; fillColor: string; _nameLower: string }[]
    > = {};

    if (this.componentsAvg && this.componentsAvg.length > 0) {
      this.componentsAvg.forEach(item => {
        if (!groupedByPoll[item.pollId]) {
          groupedByPoll[item.pollId] = [];
        }

        groupedByPoll[item.pollId].push({
          x: this.capitalize(item.name),
          y: Number(item.componentAvg.toFixed(2)),
          fillColor: this.getColorByRisk(item.componentAvg),
          _nameLower: item.name.toLowerCase(),
        });
      });
    }

    for (const pollId in groupedByPoll) {
      groupedByPoll[pollId].sort((a, b) => {
        const indexA = this.COMPONENT_ORDER.findIndex(o =>
          a._nameLower.includes(o)
        );
        const indexB = this.COMPONENT_ORDER.findIndex(o =>
          b._nameLower.includes(o)
        );
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
    }

    const newSeries: Record<number, ApexAxisChartSeries> = {};
    for (const pollId in groupedByPoll) {
      newSeries[pollId] = [
        { name: 'Component Average', data: groupedByPoll[pollId] },
      ];
    }
    this.chartSeriesByPollId = newSeries;
  }

  getColorByRisk(value: number): string {
    return getRiskColor(Math.floor(value)) ?? '#CCC';
  }

  async exportReportPdf() {
    if (this.isGeneratingPDF) return;
    this.isGeneratingPDF = true;
    await this.pdfHelper.exportToPdf({
      fileName: 'student-detail',
      container: this.mainContainer,
      preProcess: 'student-detail',
      snackBar: this.snackBar,
    });
  }

  capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
