import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
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
import { ApexChartAnnotation } from '@shared/components/charts/abstract-chart';
import { ListComponent } from '@shared/components/list/list.component';
import { Column } from '@shared/components/list/types/column';
import { EventLoad } from '@core/models/load';
import { Pagination } from '@core/services/interfaces/server.type';
import { PagedResult } from '@core/services/interfaces/page.type';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getRiskColor } from '@core/constants/riskLevel';

register();

interface SwiperEventTarget extends EventTarget {
  swiper: Swiper;
}
@Component({
  selector: 'app-student-detail',
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    CommonModule,
    ListComponent,
    MatTooltipModule,
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudentDetailComponent implements OnDestroy {
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
  isLoading = false;

  @Input({ required: true }) studentId!: number;

  columns: Column<AnswerResponse>[] = [
    {
      key: 'variable',
      label: 'Variable',
    },
    {
      key: 'position',
      label: 'Position',
    },
    {
      key: 'component',
      label: 'Component',
    },
    {
      key: 'answer',
      label: 'Answer',
    },
    {
      key: 'score',
      label: 'Score',
    },
  ];

  isMobile = false;
  pagination: Pagination = {
    pageSize: 10,
    page: 0,
  };
  totalPolls = 0;

  public chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 200,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
  };

  private destroy$ = new Subject<void>();

  constructor(private snackBar: MatSnackBar) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleLoad(studentId: number, event: EventLoad) {
    if (event) {
      this.pagination = {
        page: event.page,
        pageSize: event.pageSize,
      };
    }
    this.getStudentDetails(studentId);
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
        error: error => {
          console.error(error);
        },
      });
  }
  processedPolls = new Set<number>();
  getStudentPolls(studentId: number) {
    this.pollsService
      .getPollsByStudentId(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PollModel[]) => {
          this.studentPolls = data;
          data.forEach(studentPoll => {
            if (!this.processedPolls.has(studentPoll.id)) {
              this.processedPolls.add(studentPoll.id);
              this.getComponentsAvg(studentId, studentPoll.id);
            }
          });
          if (this.studentPolls.length > 0) {
            this.selectedPoll = this.studentPolls[0].id;
            this.getStudentAnswersByPoll(studentId, this.selectedPoll);
          }
          this.isLoading = false;
        },
        error: error => {
          console.error(error);
          this.isLoading = false;
        },
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
        error: error => {
          console.error(error);
        },
      });
  }

  getStudentAnswersByPoll(studentId: number, pollId: number) {
    this.studentService
      .getStudentAnswersByPoll(studentId, pollId, this.pagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PagedResult<AnswerResponse>) => {
          this.studentAnswers = data.items;
          this.totalStudentAnswers = data.count;
        },
        error: error => {
          console.error(error);
        },
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
        this.getStudentAnswersByPoll(this.studentId, this.selectedPoll);
      } else {
        this.studentAnswers = [];
      }
    } else {
      console.warn("Event target doesn't have a swiper");
    }
  }

  chartSeriesByPollId: Record<number, ApexAxisChartSeries> = {};

  getColorByRisk(value: number): string {
    return getRiskColor(Math.floor(value)) ?? '#CCC';
  }

  buildChartSeries() {
    const groupedByPoll: Record<number, ApexChartAnnotation[]> = {};

    if (this.componentsAvg && this.componentsAvg.length > 0) {
      this.componentsAvg.forEach(item => {
        if (!groupedByPoll[item.pollId]) {
          groupedByPoll[item.pollId] = [];
        }

        groupedByPoll[item.pollId].push({
          x: this.capitalize(item.name),
          y: Number(item.componentAvg.toFixed(2)),
          fillColor: this.getColorByRisk(item.componentAvg),
        });
      });
    }

    for (const pollId in groupedByPoll) {
      this.chartSeriesByPollId[pollId] = [
        { name: 'Component Average', data: groupedByPoll[pollId] },
      ];
    }
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
