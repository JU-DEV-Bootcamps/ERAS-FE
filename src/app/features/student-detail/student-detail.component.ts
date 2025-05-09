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
import { MatTableModule } from '@angular/material/table';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper/types';
import { AnswerResponse } from '../../core/models/answer-request.model';
import { ComponentsAvgModel } from '../../core/models/components-avg.model';
import { PollModel } from '../../core/models/poll.model';
import { StudentResponse } from '../../core/models/student-request.model';
import { PdfService } from '../../core/services/exports/pdf.service';
import { StudentService } from '../../core/services/api/student.service';
import { PollService } from '../../core/services/api/poll.service';
import { PollInstanceService } from '../../core/services/api/poll-instance.service';
import { ApexChartAnnotation } from '../../shared/components/charts/abstract-chart';

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
    MatTableModule,
    MatCardModule,
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudentDetailComponent implements OnInit, OnDestroy {
  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;
  private readonly exportPrintService = inject(PdfService);
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
  pollsService = inject(PollService);
  pollInsService = inject(PollInstanceService);

  selectedPoll = 0;
  studentPolls: PollModel[] = [];
  studentAnswers: AnswerResponse[] = [];
  componentsAvg: ComponentsAvgModel[] = [];

  @Input({ required: true }) studentId!: number;

  columns = ['variable', 'position', 'component', 'answer', 'score'];

  isMobile = false;
  pageSize = 10;
  currentPage = 0;
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

  ngOnInit(): void {
    this.getStudentDetails(this.studentId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStudentDetails(studentId: number) {
    this.studentService
      .getStudentDetailsById(studentId)
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

  getStudentPolls(studentId: number) {
    this.pollsService
      .getPollsByStudentId(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PollModel[]) => {
          this.studentPolls = data;
          data.forEach(studentPoll => {
            this.getComponentsAvg(studentId, studentPoll.id);
          });
          if (this.studentPolls.length > 0) {
            this.selectedPoll = this.studentPolls[0].id;
            this.getStudentAnswersByPoll(studentId, this.selectedPoll);
          }
        },
        error: error => {
          console.error(error);
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
      .getStudentAnswersByPoll(studentId, pollId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: AnswerResponse[]) => {
          this.studentAnswers = data;
        },
        error: error => {
          console.error(error);
        },
      });
  }

  onSlideChange(event: Event) {
    if (event.target && (event.target as SwiperEventTarget).swiper) {
      const swiperInstance = (event.target as SwiperEventTarget).swiper as Swiper;
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
    if (value >= 0 && value <= 2) {
      return '#4CAF50';
    } else if (value > 2 && value <= 3) {
      return '#E5E880';
    } else if (value > 3 && value <= 4) {
      return '#E8B079';
    } else if (value > 4) {
      return '#E68787';
    }
    return '#CCC';
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

  printStudentInfo() {
    const mainContainerElement = this.mainContainer.nativeElement;

    const clonedElement = mainContainerElement.cloneNode(true) as HTMLElement;
    clonedElement.style.width = '1440px';
    clonedElement.style.margin = 'auto';
    clonedElement
      .querySelector('#chart-student-detail')
      ?.classList.add('print-chart');

    const swiperContainer = clonedElement.querySelector('#swiper-container');
    if (swiperContainer) {
      swiperContainer.removeAttribute('effect');
    }

    const h1 = document.createElement('h1');
    h1.textContent = 'Student Details';
    h1.style.textAlign = 'center';
    h1.style.fontSize = '2em';
    h1.style.fontWeight = '500';
    clonedElement.insertBefore(h1, clonedElement.firstChild);

    clonedElement.style.fontSize = '1.2em';

    const h2Elements = clonedElement.querySelectorAll('h2');
    h2Elements.forEach(h2 => {
      h2.style.fontSize = '1.6em';
    });

    const h3Elements = clonedElement.querySelectorAll('h3');
    h3Elements.forEach(h3 => {
      h3.style.fontSize = '1.4em';
    });

    const h4Elements = clonedElement.querySelectorAll('h4');
    h4Elements.forEach(h4 => {
      h4.style.fontSize = '1.2em';
    });

    const pElements = clonedElement.querySelectorAll('p');
    pElements.forEach(p => {
      p.style.fontSize = '1.2em';
    });

    const thElements = clonedElement.querySelectorAll('th');
    thElements.forEach(th => {
      th.style.fontSize = '1.3em';
    });

    const tdElements = clonedElement.querySelectorAll('td');
    tdElements.forEach(td => {
      td.style.fontSize = '1.3em';
    });

    const tspanElements = clonedElement.querySelectorAll('tspan');
    tspanElements.forEach(tspan => {
      tspan.style.fontSize = '1.6em';
    });

    const printButton = clonedElement.querySelector('#print-button');
    printButton?.remove();

    document.body.appendChild(clonedElement);
    this.exportPrintService.exportToPDF(clonedElement, `student-detail-2.pdf`);
    document.body.removeChild(clonedElement);
  }

  capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
