import {
  Component,
  inject,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
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
import { EventAction, EventLoad } from '../../../shared/events/load';
import { ListComponent } from '../../../shared/components/list/list.component';
import { BadgeRiskComponent } from '../../../shared/components/badge-risk-level/badge-risk-level.component';
import { Pagination } from '../../../core/services/interfaces/server.type';
import { ComponentValueType } from '../types/risk-students-detail.type';

export interface SelectedHMData {
  cohortId: string;
  pollUuid: string;
  componentName: ComponentValueType;
  text?: string;
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
export class ModalQuestionDetailsComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  public inputQuestion: SelectedHMData = inject(MAT_DIALOG_DATA);
  public variableId = 0;
  private reportService = inject(ReportService);
  private PollService = inject(PollService);

  studentRisks: PollTopReport = [];
  totalStudentRisks = 0;
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
  pagination: Pagination = {
    page: 0,
    pageSize: 10,
  };

  constructor(
    public dialogRef: MatDialogRef<ModalQuestionDetailsComponent>,
    private cdr: ChangeDetectorRef
  ) {}

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
      .getTopPollReport([this.variableId], pollInstanceUUID, this.pagination)
      .subscribe(data => {
        this.studentRisks = data.body.items || [];
        this.totalStudentRisks = data.body.count || 0;
        this.cdr.detectChanges();
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
