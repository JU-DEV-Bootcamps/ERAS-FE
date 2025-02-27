import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { AppComponent } from '../../shared/components/charts/summary-survey/summary-survey.component';
import { PieChartComponent } from '../../shared/components/charts/pie-chart/pie-chart.component';
import { Router } from '@angular/router';
import { PollService } from '../../core/services/poll.service';
import { StudentService } from '../../core/services/student.service';

const studentsPlaceholder = {
  count: 23,
};
const surveysPLaceholder = {
  count: 3,
};
const lastSurveyPlaceholder = {
  id: 1,
  title: 'Encuesta de Caracterizacion',
  version: 'latest',
  progress: '23/32',
  publishedDate: '10/10/2024',
  deadlineDate: '01/03/2025',
  average: 3.8,
  riskStudents: 3,
};

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIcon,
    AppComponent,
    PieChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  students = studentsPlaceholder;
  surveys = surveysPLaceholder;
  lastPoll = lastSurveyPlaceholder;

  router = inject(Router);
  studentService = inject(StudentService);
  pollService = inject(PollService);

  ngOnInit(): void {
    this.loadPollsSummary();
    this.loadStudentsSummary();
  }

  loadPollsSummary(): void {
    this.pollService.getPollCount().subscribe(count => {
      this.surveys.count = count;
    });
    this.pollService.getLastPoll().subscribe(data => {
      this.lastPoll = data;
    });
  }

  loadStudentsSummary(): void {
    this.studentService.getStudentsCount().subscribe(count => {
      this.students.count = count;
    });
  }

  redirectToLastSurvey() {
    this.router.navigate([`polls/${this.lastPoll.id}`]);
  }
}
