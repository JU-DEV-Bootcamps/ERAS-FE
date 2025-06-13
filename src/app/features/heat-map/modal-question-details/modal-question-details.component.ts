import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
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
  MatDialog,
} from '@angular/material/dialog';
import {
  PollAvgQuestion,
  PollCountQuestion,
  PollTopReport,
  StudentReportAnswerRiskLevel,
} from '../../../core/models/summary.model';
import {
  getRiskColor,
  getRiskTextColor,
} from '../../../core/constants/riskLevel';
import { ReportService } from '../../../core/services/api/report.service';
import { PollService } from '../../../core/services/api/poll.service';
import { ModalStudentDetailComponent } from '../../modal-student-detail/modal-student-detail.component';
import { Column } from '../../../shared/components/list/types/column';
import { ActionDatas } from '../../../shared/components/list/types/action';
import { EventAction } from '../../../shared/events/load';
import { ListComponent } from '../../../shared/components/list/list.component';
import { BadgeRiskComponent } from '../../../shared/components/badge-risk-level/badge-risk-level.component';

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
    ListComponent,
    BadgeRiskComponent,
  ],
  templateUrl: './modal-question-details.component.html',
  styleUrl: './modal-question-details.component.css',
})
export class ModalQuestionDetailsComponent implements OnInit, AfterViewInit {
  readonly dialog = inject(MatDialog);
  public inputQuestion: SelectedHMData = inject(MAT_DIALOG_DATA);
  public variableId = 0;
  private reportService = inject(ReportService);
  private PollService = inject(PollService);

  public studentsRisk: PollTopReport = [];
  public studentTableColumns: string[] = ['name', 'answer', 'risk', 'actions'];
  columns: Column<StudentReportAnswerRiskLevel>[] = [
    {
      key: 'studentName',
      label: 'Name',
    },
    {
      key: 'answerText',
      label: 'Answer',
    },
  ];
  columnTemplates: Column<StudentReportAnswerRiskLevel>[] = [
    {
      key: 'answerRisk',
      label: 'Risk Level',
    },
  ];
  actionDatas: ActionDatas = [
    {
      columnId: 'actions',
      id: 'openStudentDetails',
      label: 'Actions',
      ngIconName: 'visibility',
      tooltip: 'View details',
    },
  ];

  constructor(public dialogRef: MatDialogRef<ModalQuestionDetailsComponent>) {}

  ngOnInit(): void {
    this.loadComponentsAndVariables();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dialogRef.updateSize('auto');
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  loadComponentsAndVariables(): void {
    const pollInstanceUUID: string = this.inputQuestion.pollUuid;
    this.PollService.getVariablesByComponents(
      pollInstanceUUID,
      [this.inputQuestion.componentName.toLowerCase()],
      true
    ).subscribe(res => {
      const variable = res.find(
        variable => variable.name == this.inputQuestion.question.question
      );
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
    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: studentId },
    });
  }

  isPollAvgQuestion(question: PollAvgQuestion | PollCountQuestion) {
    return question && 'averageAnswer' in question && 'averageRisk' in question;
  }

  handleLoadCalled() {
    this.loadComponentsAndVariables();
  }

  handleActionCalled(event: EventAction) {
    const actions: Record<
      string,
      (item: StudentReportAnswerRiskLevel) => void
    > = {
      openStudentDetails: (element: StudentReportAnswerRiskLevel) => {
        this.openStudentDetails(element.studentId);
      },
    };

    if (actions[event.data.id]) {
      actions[event.data.id](event.item as StudentReportAnswerRiskLevel);
    }
  }
}
