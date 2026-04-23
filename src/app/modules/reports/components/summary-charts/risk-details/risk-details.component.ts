import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

import { ActionDatas } from '@shared/components/list/types/action';
import { Column } from '@shared/components/list/types/column';
import { EventAction, EventLoad } from '@core/models/load';
import { Pagination } from '@core/services/interfaces/server.type';
import { PollAvgQuestion, PollTopReport } from '@core/models/summary.model';

import { PollService } from '@core/services/api/poll.service';
import { ReportService } from '@core/services/api/report.service';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';

import { BadgeRiskComponent } from '@shared/components/badge-risk-level/badge-risk-level.component';
import { ListComponent } from '@shared/components/list/list.component';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ComponentType } from '@angular/cdk/overlay';

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
  private featureFlags = inject(FeatureFlagsService);

  private PollService = inject(PollService);
  private reportService = inject(ReportService);
  private evaluationDetailsService = inject(EvaluationDetailsService);
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
    { items: EvaluationDetailsStudentResponse[]; total: number }
  >();

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
    this.evaluationDetailsService
      .getStudentsByFilters(
        pollInstanceUUID,
        [this.data.data.componentName.toLowerCase()],
        this.data.data.cohorts,
        [this.variableId],
        this.pagination.pageSize,
        this.pagination.page
      )
      .subscribe(data => {
        const items = (data?.items ?? []).sort((a, b) => {
          if (b.riskLevel !== a.riskLevel) {
            return b.riskLevel - a.riskLevel;
          }
          return a.answerText.localeCompare(b.answerText);
        });
        const total = data?.count ?? 0;
        this.riskStudentData.set(risk.position, { items, total });
        this.totalStudentRisks.set(total);
      });
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

  openStudentDetails(studentId: number): void {
    const showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.studentDetails);
    const component: ComponentType<object> = showV2
      ? ModalStudentDetailV2Component
      : ModalStudentDetailComponent;

    this.dialog.open(component, {
      width: '1152px',
      maxWidth: '95vw',
      maxHeight: '921.59px',
      panelClass: 'border-modalbox-dialog',
      data: { studentId },
    });
  }
}
