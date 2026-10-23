import {
  Component,
  input,
  output,
  signal,
  inject,
  OnChanges,
  SimpleChanges,
  effect,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

import { PollAvgQuestion } from '@core/models/summary.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { Column } from '@shared/components/list/types/column';
import { ActionDatas } from '@shared/components/list/types/action';
import { EventAction, EventLoad } from '@core/models/load';
import { Pagination } from '@core/services/interfaces/server.type';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { ComponentType } from '@angular/cdk/portal';

import { PollService } from '@core/services/api/poll.service';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { MatDialog } from '@angular/material/dialog';

import { ListComponent } from '@shared/components/list/list.component';
import { BadgeRiskComponent } from '@shared/components/badge-risk-level/badge-risk-level.component';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export interface ColumnRiskPanelData {
  cohortIds: number[];
  pollUuid: string;
  componentName: ComponentValueType;
  title: string;
  questions: PollAvgQuestion[];
  evaluationId?: number | string;
}

@Component({
  selector: 'app-column-risk-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    ListComponent,
    BadgeRiskComponent,
    MatProgressSpinner,
  ],
  templateUrl: './column-risk-panel.component.html',
  styleUrl: './column-risk-panel.component.scss',
})
export class ColumnRiskPanelComponent implements OnChanges {
  data = input.required<ColumnRiskPanelData | null>();
  closed = output<void>();

  private readonly dialog = inject(MatDialog);
  private readonly pollService = inject(PollService);
  private readonly evaluationDetailsService = inject(EvaluationDetailsService);
  private readonly featureFlags = inject(FeatureFlagsService);

  riskStudentData = signal<
    Map<number, { items: EvaluationDetailsStudentResponse[]; total: number }>
  >(new Map());

  pagination: Pagination = { page: 0, pageSize: 10 };

  variablesCache = new Map<string, number>();

  columns: Column<EvaluationDetailsStudentResponse>[] = [
    { key: 'name', label: 'Name' },
    { key: 'answerText', label: 'Answer' },
  ];
  columnTemplates: Column<EvaluationDetailsStudentResponse>[] = [
    { key: 'riskLevel', label: 'Risk Level' },
  ];
  actionDatas: ActionDatas = [
    {
      columnId: 'actions',
      id: 'openStudentDetails',
      label: 'Actions',
      ngIconName: 'open_in_new',
      tooltip: 'View details',
    },
  ];
  variablesCacheReady = signal(false);

  constructor() {
    effect(() => {
      if (this.variablesCacheReady()) {
        const panelData = this.data();
        if (!panelData) return;

        panelData.questions.forEach(risk => {
          const variableId = this.variablesCache.get(
            `${risk.question}__${risk.position}`
          );
          if (variableId !== undefined) {
            this.loadStudentList(risk, variableId);
          }
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data()) {
      this.riskStudentData.set(new Map());
      this.pagination = { page: 0, pageSize: 10 };
      this.variablesCache = new Map();
      this.variablesCacheReady.set(false);

      this._preloadVariables();
    }
  }

  close(): void {
    this.closed.emit();
  }

  private _preloadVariables(): void {
    const panelData = this.data();
    if (!panelData) return;

    this.pollService
      .getVariablesByComponents(
        panelData.pollUuid,
        [panelData.componentName.toLowerCase()],
        true
      )
      .subscribe(response => {
        response.forEach(v => {
          this.variablesCache.set(`${v.name}__${v.position}`, v.id);
        });
        this.variablesCacheReady.set(true);
      });
  }

  handleLoadCalled(event: EventLoad, risk: PollAvgQuestion): void {
    this.pagination = { page: event.page, pageSize: event.pageSize };
    if (!this.variablesCacheReady()) {
      return;
    }
    const variableId = this.variablesCache.get(
      `${risk.question}__${risk.position}`
    );
    if (variableId === undefined) return;
    this.loadStudentList(risk, variableId);
  }

  loadStudentList(risk: PollAvgQuestion, variableId: number): void {
    const panelData = this.data();
    if (!panelData || variableId === 0) return;

    this.evaluationDetailsService
      .getStudentsByFilters(
        panelData.pollUuid,
        [panelData.componentName.toLowerCase()],
        panelData.cohortIds,
        [variableId],
        this.pagination.pageSize,
        this.pagination.page,
        undefined,
        panelData.evaluationId
      )
      .subscribe(data => {
        const items = (data?.items ?? []).sort((a, b) => {
          if (b.riskLevel !== a.riskLevel) return b.riskLevel - a.riskLevel;
          return a.answerText.localeCompare(b.answerText);
        });
        const updated = new Map(this.riskStudentData());
        updated.set(risk.position, { items, total: data?.count ?? 0 });
        this.riskStudentData.set(updated);
      });
  }

  handleActionCalled(event: EventAction): void {
    const actions: Record<
      string,
      (item: EvaluationDetailsStudentResponse) => void
    > = {
      openStudentDetails: element => this.openStudentDetails(element.id),
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
