import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from '../../shared/components/charts/pie-chart/pie-chart.component';
import { Router, RouterLink } from '@angular/router';
import { PollService } from '../../core/services/poll.service';
import { StudentService } from '../../core/services/student.service';

const studentsPlaceholder = {
  count: 23,
};
const pollsPLaceholder = {
  count: 3,
};
const lastPollPlaceholder = {
  id: 1,
  title: 'Encuesta de Caracterizacion',
  version: '#latest',
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
    BarChartComponent,
    PieChartComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  students = studentsPlaceholder;
  polls = pollsPLaceholder;
  lastPoll = lastPollPlaceholder;

  router = inject(Router);
  studentService = inject(StudentService);
  pollService = inject(PollService);

  ngOnInit(): void {
    this.loadPollsSummary();
    this.loadStudentsSummary();
  }

  loadPollsSummary(): void {
    this.pollService.getDataPollList().subscribe(data => {
      this.polls.count = data.length;
      this.lastPoll = data[0];
    });
  }

  loadStudentsSummary(): void {
    this.studentService.getStudentsCount().subscribe(data => {
      this.students.count = data;
    });
  }

  redirectToLastPoll() {
    this.router.navigate([`polls/${this.lastPoll.id}`]);
  }
}
