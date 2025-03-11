import {
  Component,
  inject,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { Swiper } from 'swiper/types';
import { register } from 'swiper/element/bundle';
register();
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

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
export class StudentDetailComponent implements OnInit {
  studentDetails: Student = {} as Student;
  studentService = inject(StudentService);
  pollsService = inject(PollService);
  componentService = inject(ComponentsService);
  answersService = inject(AnswersService);

  selectedPoll = 0;
  studentPolls: StudentPoll[] = [];
  studentAnswers: Answer[] = [];
  componentsAvg: ComponentAvg[] = [];

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

  ngOnInit(): void {
    this.getStudentDetails(26);
  }

  getStudentDetails(studentId: number) {
    this.studentService.getStudentDetailsById(studentId).subscribe({
      next: (data: Student) => {
        this.studentDetails = data;
        this.getStudentPolls(studentId);
      },
      error: error => {
        console.log(error);
      },
    });
  }

  getStudentPolls(studentId: number) {
    this.pollsService.getPollsByStudentId(studentId).subscribe({
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
        console.log(error);
      },
    });
  }

  getComponentsAvg(studentId: number, pollId: number) {
    this.componentService
      .getComponentsRiskByPollForStudent(studentId, pollId)
      .subscribe({
        next: (data: ComponentAvg[]) => {
          this.componentsAvg = [...this.componentsAvg, ...data];
          this.buildChartSeries();
        },
        error: error => {
          console.log(error);
        },
      });
  }

  getStudentAnswersByPoll(studentId: number, pollId: number) {
    this.answersService.getStudentAnswersByPoll(studentId, pollId).subscribe({
      next: (data: Answer[]) => {
        console.log('Loading Table');
        this.studentAnswers = data;
      },
      error: error => {
        console.log(error);
      },
    });
  }

  onSlideChange(event: any) {
    const swiperInstance = event.target.swiper as Swiper;
    const activeIndex = swiperInstance.activeIndex;
    console.log('Active index:', activeIndex);
    if (this.studentPolls[activeIndex]) {
      this.selectedPoll = this.studentPolls[activeIndex].id;
      this.getStudentAnswersByPoll(26, this.selectedPoll);
    } else {
      this.studentAnswers = [];
    }
  }

  chartSeriesByPollId: { [pollId: number]: ApexAxisChartSeries } = {};

  getColorByRisk(value: number): string {
    if (value >= 0 && value <= 2) {
      return '#4CAF50';
    } else if (value > 2 && value <= 3) {
      return '#E5E880';
    } else if (value > 3 && value <= 4) {
      return '#E8B079';
    } else if (value > 4 && value <= 5) {
      return '#E68787';
    }
    return '#CCC';
  }

  buildChartSeries() {
    const groupedByPoll: { [pollId: number]: any[] } = {};

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

    for (const pollId in groupedByPoll) {
      this.chartSeriesByPollId[pollId] = [{ data: groupedByPoll[pollId] }];
    }
  }

  printStudentInfo() {
    console.log('To implement the PDF');
  }

  capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
