import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { BarChartComponent } from '../charts/bar-chart/bar-chart.component';
import { PieChartComponent } from '../charts/pie-chart/pie-chart.component';
import { ReportService } from '../../../core/services/api/report.service';
import { PollTopReport } from '../../../core/models/summary.model';
import { CohortService } from '../../../core/services/api/cohort.service';
import { ListComponent } from '../list/list.component';
import { BadgeRiskComponent } from '../badge-risk-level/badge-risk-level.component';
import { Column } from '../list/types/column';

interface StudentSummary {
  studentUuid: string;
  studentName: string;
  cohortId: number;
  cohortName: string;
  pollinstancesAverage: number;
  pollinstancesCount: number;
}

interface StudentRisk {
  name: string;
  risk: number;
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
    MatProgressSpinnerModule,
    BarChartComponent,
    PieChartComponent,
    ListComponent,
    BadgeRiskComponent,
  ],
  templateUrl: './risk-students-table.component.html',
  styleUrls: ['./risk-students-table.component.scss'],
})
export class RiskStudentsTableComponent implements OnChanges {
  private reportService = inject(ReportService);
  private cohortService = inject(CohortService);

  @Input() pollUUID!: string;
  @Input() variableIds!: number[];

  public studentRisk: PollTopReport = [];
  public studentDataResponse: StudentDataResponse[] = [];
  public displayedColumns: string[] = ['name', 'risk'];

  columns: Column<StudentRisk>[] = [
    {
      key: 'name',
      label: 'Name',
    },
  ];
  columnTemplates: Column<StudentRisk>[] = [
    {
      key: 'risk',
      label: 'Risk',
    },
  ];

  studentNames: string[] = [];
  risks: number[] = [];
  studentRisks: StudentRisk[] = [];
  totalStudentRisks = 0;

  public lastPoll = lastPollPlaceholder;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pollUUID'] || changes['variableIds']) {
      if (this.isValidData()) {
        this.loadStudentRisk();
      }
      this.loadCohorts();
    }
    if (changes['studentName'] || changes['studentRiskDetail']) {
      this.updateChartData();
    }
  }

  private loadStudentRisk(): void {
    this.reportService
      .getTopPollReport(this.variableIds, this.pollUUID)
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
    this.cohortService.getCohortsSummary().subscribe({
      next: data => {
        this.studentDataResponse = Array.isArray(data) ? data : [data];
        this.createDataChar();
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

  private isValidData(): boolean {
    return (
      !!this.pollUUID &&
      Array.isArray(this.variableIds) &&
      this.variableIds.length > 0
    );
  }

  private createDataChar(): void {
    this.studentNames = [];
    this.risks = [];
    this.studentRisks = [];
    this.totalStudentRisks = 0;
    this.studentDataResponse.flatMap(studentData =>
      studentData.summary.forEach(student => {
        const name = student.studentName;
        const risk = Math.round(student.pollinstancesAverage);
        const studentRisk: StudentRisk = {
          name,
          risk,
        };

        this.studentNames.push(name);
        this.risks.push(risk);
        this.studentRisks.push(studentRisk);
      })
    );
    this.totalStudentRisks = this.studentRisks.length;
  }

  private updateChartData(): void {
    if (this.studentRisks.length > 0) {
      this.createDataChar();
    }
    this.createDataChar();
  }

  handleLoadCalled() {
    if (this.isValidData()) {
      this.loadStudentRisk();
    }
    this.loadCohorts();
  }
}
