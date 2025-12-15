import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

import { ActionDatas } from '@shared/components/list/types/action';
import { Column } from '@shared/components/list/types/column';
import { EventAction, EventLoad } from '@core/models/load';
import { Pagination } from '@core/services/interfaces/server.type';
import {
  PollAvgQuestion,
  PollTopReport,
  StudentReportAnswerRiskLevel,
} from '@core/models/summary.model';

import { PollService } from '@core/services/api/poll.service';
import { ReportService } from '@core/services/api/report.service';

import { BadgeRiskComponent } from '@shared/components/badge-risk-level/badge-risk-level.component';
import { ListComponent } from '@shared/components/list/list.component';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';

@Component({
  selector: 'app-risk-details',
  imports: [
    BadgeRiskComponent,
    MatExpansionModule,
    CommonModule,
    ListComponent,
  ],
  templateUrl: './risk-details.component.html',
  styleUrl: './risk-details.component.scss',
})
export default class RiskDetailsComponent {
  readonly data = inject(MAT_DIALOG_DATA);
  readonly panelOpenState = signal(false);

  private PollService = inject(PollService);
  private reportService = inject(ReportService);
  public variableId = 0;
  readonly dialog = inject(MatDialog);

  pagination: Pagination = {
    page: 0,
    pageSize: 10,
  };
  studentRisks = signal<PollTopReport>([]);
  totalStudentRisks = signal(0);
  riskStudentData = new Map<
    number,
    { items: StudentReportAnswerRiskLevel[]; total: number }
  >();

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

  handleLoadCalled(event: EventLoad, risk: PollAvgQuestion) {
    this.pagination = {
      page: event.page,
      pageSize: event.pageSize,
    };
    this.loadComponentsAndVariables(risk);
  }

  loadComponentsAndVariables(risk: PollAvgQuestion) {
    const pollInstanceUUID: string = this.data.data.pollUuid;
    this.PollService.getVariablesByComponents(
      pollInstanceUUID,
      [this.data.data.componentName.toLowerCase()],
      true
    ).subscribe(response => {
      const variable = response.find(
        variable =>
          variable.name === risk.question && variable.position === risk.position
      );
      if (!variable) return;
      this.variableId = variable.id;
      this.loadStudentList(risk);
    });
  }

  loadStudentList(risk: PollAvgQuestion) {
    const pollInstanceUUID: string = this.data.data.pollUuid;
    if (this.variableId === 0) return;
    this.reportService
      .getTopPollReport([this.variableId], pollInstanceUUID, this.pagination)
      .subscribe(data => {
        this.riskStudentData.set(risk.position, {
          items: data.body.items || [],
          total: data.body.count || 0,
        });
      });
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

  openStudentDetails(studentId: number): void {
    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: studentId },
    });
  }
}
