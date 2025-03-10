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

import { register } from 'swiper/element/bundle';
import { CommonModule } from '@angular/common';
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

  pollSelected = 0;
  studentPolls: StudentPoll[] = [];
  studentAnswers: Answer[] = [];
  componentsAvg: ComponentAvg[] = [];

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
    series: [
      {
        data: [
          {
            x: 'Socioeconómico',
            y: 10,
            fillColor: '#E68787',
          },
          {
            x: 'Individual',
            y: 18,
            fillColor: '#E8B079',
          },
          {
            x: 'Academico',
            y: 13,
            fillColor: '#E5E880',
          },
          {
            x: 'Familiar',
            y: 13,
            fillColor: '#DFF8E3',
          },
        ],
      },
    ],
  };

  ngOnInit(): void {
    this.getStudentDetails(26);
    /* this.getComponentsAvg(26,1); */
    /* this.getStudentAnswersByPoll(26,1); */
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
          this.componentsAvg = data;
        },
        error: error => {
          console.log(error);
        },
      });
  }

  getStudentAnswersByPoll(studentId: number, pollId: number) {
    this.answersService.getStudentAnswersByPoll(studentId, pollId).subscribe({
      next: (data: Answer[]) => {
        console.log(data);
      },
      error: error => {
        console.log(error);
      },
    });
  }

  printStudentInfo() {
    console.log('To implement the PDF');
  }
}
