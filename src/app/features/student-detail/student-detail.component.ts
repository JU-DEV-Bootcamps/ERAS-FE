import {
  Component,
  inject,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexOptions } from 'ng-apexcharts';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { StudentService } from '../../core/services/student.service';

import { PollService } from '../../core/services/poll.service';
import { Student } from '../../shared/models/student/student.model';
import { StudentPoll } from '../../shared/models/polls/student-polls.model';
import { ComponentsService } from '../../core/services/components.service';
import { AnswersService } from '../../core/services/answers.service';
import { ComponentAvg } from '../../shared/models/components/component-avg.model';
import { Answer } from '../../shared/models/answers/answer.model';
import { Audit } from '../../shared/models/audit.model';
import { Swiper } from 'swiper/types';
import { register } from 'swiper/element/bundle';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, Subject } from 'rxjs';
import { PdfService } from '../../core/services/report/pdf.service';

register();
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
  studentDetails: Student = {
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
        audit: null,
        id: 0,
      },
      audit: {} as Audit,
      cohortId: 0,
      cohort: null,
      id: 0,
    },
    message: '',
    success: false,
  };

  studentService = inject(StudentService);
  pollsService = inject(PollService);
  componentService = inject(ComponentsService);
  answersService = inject(AnswersService);

  selectedPoll = 0;
  studentPolls: StudentPoll[] = [];
  studentAnswers: Answer[] = [];
  componentsAvg: ComponentAvg[] = [];
  studentId!: number;

  constructor(private route: ActivatedRoute) {}

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
    this.route.params.subscribe(params => {
      this.studentId = +params['studentId'];
      this.getStudentDetails(this.studentId);
    });
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
        next: (data: Student) => {
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
        next: (data: StudentPoll[]) => {
          this.studentPolls = data;
          data.forEach((studentPoll: StudentPoll) => {
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
    this.componentService
      .getComponentsRiskByPollForStudent(studentId, pollId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ComponentAvg[]) => {
          this.componentsAvg = [...this.componentsAvg, ...data];
          this.buildChartSeries();
        },
        error: error => {
          console.error(error);
        },
      });
  }

  getStudentAnswersByPoll(studentId: number, pollId: number) {
    this.answersService
      .getStudentAnswersByPoll(studentId, pollId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Answer[]) => {
          this.studentAnswers = data;
        },
        error: error => {
          console.error(error);
        },
      });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSlideChange(event: any) {
    const swiperInstance = event.target.swiper as Swiper;
    const activeIndex = swiperInstance.activeIndex;
    if (this.studentPolls[activeIndex]) {
      const pollId = this.studentPolls[activeIndex].id;
      this.selectedPoll = pollId;
      this.getStudentAnswersByPoll(this.studentId, this.selectedPoll);
    } else {
      this.studentAnswers = [];
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/no-explicit-any
    const groupedByPoll: { [pollId: number]: any[] } = {};

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
