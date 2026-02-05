import { Component, inject, AfterViewInit, signal } from '@angular/core';
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
import { PollAvgQuestion, PollCountQuestion } from '@core/models/summary.model';
import { getRiskColor, getRiskTextColor } from '@core/constants/riskLevel';
import { ReportService } from '@core/services/api/report.service';
import { PollService } from '@core/services/api/poll.service';
import { ModalStudentDetailComponent } from '../modal-student-detail/modal-student-detail.component';
import { Column } from '@shared/components/list/types/column';
import { ActionDatas } from '@shared/components/list/types/action';
import { EventAction, EventLoad } from '@core/models/load';
import { ListComponent } from '@shared/components/list/list.component';
import { BadgeRiskComponent } from '@shared/components/badge-risk-level/badge-risk-level.component';
import { Pagination } from '@core/services/interfaces/server.type';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';

export interface SelectedHMData {
  cohortId: string;
  pollUuid: string;
  componentName: ComponentValueType;
  text?: string;
  question: PollAvgQuestion | PollCountQuestion;
  riskLevel?: number;
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
  styleUrl: './modal-question-details.component.scss',
})
export class ModalQuestionDetailsComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  public inputQuestion: SelectedHMData = inject(MAT_DIALOG_DATA);
  public variableId = 0;
  private reportService = inject(ReportService);
  private PollService = inject(PollService);
  private evaluationDetailsService = inject(EvaluationDetailsService);

  studentList = signal<EvaluationDetailsStudentResponse[]>([]);
  totalStudentRisks = signal(0);

  columns: Column<EvaluationDetailsStudentResponse>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'answerText',
      label: 'Answer',
    },
  ];
  columnTemplates: Column<EvaluationDetailsStudentResponse>[] = [
    {
      key: 'riskLevel',
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
  pagination: Pagination = {
    page: 0,
    pageSize: 10,
  };

  constructor(public dialogRef: MatDialogRef<ModalQuestionDetailsComponent>) {}

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
    ).subscribe(response => {
      const variable = response.find(
        variable =>
          variable.name == this.inputQuestion.question.question &&
          variable.position === this.inputQuestion.question.position
      );
      if (!variable) return;
      this.variableId = variable.id;
      this.loadStudents();
    });
  }

  loadStudents(): void {
    this.evaluationDetailsService
      .getStudentsByFilters(
        this.inputQuestion.pollUuid,
        [this.inputQuestion.componentName.toLowerCase()],
        this.inputQuestion.cohortId.split(',').map(id => Number(id.trim())),
        [this.variableId],
        [this.inputQuestion.riskLevel!]
      )
      .subscribe(data => {
        this.studentList.set(data);
        this.totalStudentRisks.set(data.length);
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
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: studentId },
    });
  }

  isPollAvgQuestion(question: PollAvgQuestion | PollCountQuestion) {
    return question && 'averageAnswer' in question && 'averageRisk' in question;
  }

  handleLoadCalled(event: EventLoad) {
    this.pagination = {
      page: event.page,
      pageSize: event.pageSize,
    };
    this.loadComponentsAndVariables();
  }

  handleActionCalled(event: EventAction) {
    const actions: Record<
      string,
      (item: EvaluationDetailsStudentResponse) => void
    > = {
      openStudentDetails: (element: EvaluationDetailsStudentResponse) => {
        this.openStudentDetails(element.id);
      },
    };

    if (actions[event.data.id]) {
      actions[event.data.id](event.item as EvaluationDetailsStudentResponse);
    }
  }
}
