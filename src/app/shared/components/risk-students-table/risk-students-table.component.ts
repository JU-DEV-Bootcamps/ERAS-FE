import {
  Component,
  inject,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { ReportService } from '../../../core/services/report.service.ts.service';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { BarChartComponent } from '../charts/bar-chart/bar-chart.component';
import { PieChartComponent } from '../charts/pie-chart/pie-chart.component';
import { CohortService } from '../../../core/services/cohort.service';

interface StudentRisk {
  name: string;
  answer: string;
  risk: number;
}

interface StudentSummary {
  studentUuid: string;
  studentName: string;
  cohortId: number;
  cohortName: string;
  pollinstancesAverage: number;
  pollinstancesCount: number;
}

interface StudentDataResponse {
  cohortCount: number;
  studentCount: number;
  summary: StudentSummary[];
}

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
  selector: 'app-risk-students-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    BarChartComponent,
    PieChartComponent,
  ],
  templateUrl: './risk-students-table.component.html',
  styleUrls: ['./risk-students-table.component.scss'],
})
export class RiskStudentsTableComponent implements OnInit, OnChanges {
  private reportService = inject(ReportService);
  private cohortService = inject(CohortService);

  @Input() pollUUID!: string;
  @Input() variableIds!: number[];

  public studentRisk: StudentRisk[] = [];
  public studentDataResponse: StudentDataResponse[] = [];
  public displayedColumns: string[] = ['name', 'risk'];
  public lastPoll = lastPollPlaceholder;

  ngOnInit(): void {
    this.loadStudentRisk();
    this.loadCohorts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['pollUUID'] ||
      changes['variableId'] ||
      changes['variableIds']
    ) {
      this.loadStudentRisk();
      this.loadCohorts();
    }
  }

  private loadStudentRisk(): void {
    this.reportService
      .getStudentsDetailByPool(this.pollUUID, null, this.variableIds)
      .subscribe({
        next: data => {
          this.studentRisk = data.body || [];
        },
        error: err => {
          console.error('Error fetching student risk data:', err);
          this.studentRisk = [];
        },
      });
  }

  private loadCohorts(): void {
    console.error('xxxx');
    this.cohortService.getCohortsSummary().subscribe({
      next: data => {
        this.studentDataResponse = data.body || [];
      },
      error: err => {
        console.error('Error fetching student risk data:', err);
        this.studentDataResponse = [];
      },
    });
  }

  getRiskColor(riskLevel: number): string {
    const riskColors = new Map([
      [1, '#008000'],
      [2, '#3CB371'],
      [3, '#F0D722'],
      [4, '#FFA500'],
      [5, '#FF0000'],
    ]);
    return riskColors.get(riskLevel) || '#FF0000';
  }
}
