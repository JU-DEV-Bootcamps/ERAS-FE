import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  PollAvgQuestion,
  PollCountQuestion,
  PollTopReport,
} from '../../../core/models/summary.model';
import {
  getRiskColor,
  getRiskTextColor,
} from '../../../core/constants/riskLevel';
import { ReportService } from '../../../core/services/api/report.service';
import { PollService } from '../../../core/services/api/poll.service';

export interface SelectedHMData {
  cohortId: string;
  pollUuid: string;
  componentName: string;
  question: PollAvgQuestion | PollCountQuestion;
}

@Component({
  selector: 'app-modal-risk-students-variables',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatMenuModule,
  ],
  templateUrl: './modal-question-details.component.html',
  styleUrl: './modal-question-details.component.css',
})
export class ModalQuestionDetailsComponent implements OnInit {
  public inputQuestion: SelectedHMData = inject(MAT_DIALOG_DATA);
  public variableId = 0;
  private reportService = inject(ReportService);
  private PollService = inject(PollService);

  public studentsRisk: PollTopReport = [];
  public studentTableColumns: string[] = ['name', 'answer', 'risk', 'actions'];
  constructor(public dialogRef: MatDialogRef<ModalQuestionDetailsComponent>) {}

  ngOnInit(): void {
    this.loadComponentsAndVariables();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  loadComponentsAndVariables(): void {
    const pollInstanceUUID: string = this.inputQuestion.pollUuid;
    this.PollService.getVariablesByComponents(pollInstanceUUID, [
      this.inputQuestion.componentName.toLowerCase(),
    ]).subscribe(res => {
      const variable = res.find(
        variable => variable.name == this.inputQuestion.question.question
      );
      console.error(this.inputQuestion.question.question, 'not found');
      if (!variable) return;
      this.variableId = variable.id;
      this.loadStudentList();
    });
  }

  loadStudentList(): void {
    const pollInstanceUUID: string = this.inputQuestion.pollUuid;
    if (this.variableId === 0) return;
    this.reportService
      .getTopPollReport([this.variableId], pollInstanceUUID)
      .subscribe(data => {
        this.studentsRisk = data.body;
      });
  }

  getRiskColor(riskLevel: number): string {
    return getRiskColor(riskLevel);
  }

  getTextRiskColor(riskLevel: number): string {
    return getRiskTextColor(riskLevel);
  }

  openStudentDetails(studentId: number): void {
    window.open(`student-details/${studentId}`, '_blank');
  }

  isPollAvgQuestion(question: PollAvgQuestion | PollCountQuestion) {
    return question && 'averageAnswer' in question && 'averageRisk' in question;
  }
}
