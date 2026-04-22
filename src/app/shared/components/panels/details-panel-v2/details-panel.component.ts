import {
  Component,
  input,
  output,
  signal,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PollAvgQuestion, PollCountQuestion } from '@core/models/summary.model';
import { getRiskColor, getRiskTextColor } from '@core/constants/riskLevel';
import { PollService } from '@core/services/api/poll.service';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { Column } from '@shared/components/list/types/column';
import { ActionDatas } from '@shared/components/list/types/action';
import { EventAction, EventLoad } from '@core/models/load';
import { Pagination } from '@core/services/interfaces/server.type';
import { ListComponent } from '@shared/components/list/list.component';
import { BadgeRiskComponent } from '@shared/components/badge-risk-level/badge-risk-level.component';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { ListDetailsComponent } from '@shared/components/list-details/list-details.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ComponentType } from '@angular/cdk/portal';

export interface DetailsPanelData {
  cohortId: string;
  pollUuid: string;
  componentName: ComponentValueType;
  text?: string;
  question: PollAvgQuestion | PollCountQuestion;
  riskLevel?: number;
  evaluationId?: number | string;
}

@Component({
  selector: 'app-details-panel',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ListComponent,
    BadgeRiskComponent,
    ListDetailsComponent,
  ],
  templateUrl: './details-panel.component.html',
  styleUrl: './details-panel.component.scss',
})
export class DetailsPanelComponent implements OnChanges {
  data = input.required<DetailsPanelData | null>();
  closed = output<void>();

  private readonly dialog = inject(MatDialog);
  private readonly pollService = inject(PollService);
  private readonly evaluationDetailsService = inject(EvaluationDetailsService);
  private readonly featureFlags = inject(FeatureFlagsService);

  studentList = signal<EvaluationDetailsStudentResponse[]>([]);
  totalStudentRisks = signal(0);
  variableId = 0;

  pagination: Pagination = { page: 0, pageSize: 10 };

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
      ngIconName: 'visibility',
      tooltip: 'View details',
    },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data()) {
      this.pagination = { page: 0, pageSize: 10 };
      this.studentList.set([]);
      this.loadComponentsAndVariables();
    }
  }

  close(): void {
    this.closed.emit();
  }

  loadComponentsAndVariables(): void {
    const panelData = this.data();
    if (!panelData) return;

    this.pollService
      .getVariablesByComponents(
        panelData.pollUuid,
        [panelData.componentName.toLowerCase()],
        true
      )
      .subscribe(response => {
        const variable = response.find(
          v =>
            v.name === panelData.question.question &&
            v.position === panelData.question.position
        );
        if (!variable) return;
        this.variableId = variable.id;
        this.loadStudents();
      });
  }

  loadStudents(): void {
    const panelData = this.data();
    if (!panelData) return;

    this.evaluationDetailsService
      .getStudentsByFilters(
        panelData.pollUuid,
        [panelData.componentName.toLowerCase()],
        panelData.cohortId.split(',').map(id => Number(id.trim())),
        [this.variableId],
        this.pagination.pageSize,
        this.pagination.page,
        panelData.riskLevel ? [panelData.riskLevel] : undefined,
        panelData.evaluationId
      )
      .subscribe(data => {
        const items = (data?.items ?? []).sort((a, b) => {
          if (b.riskLevel !== a.riskLevel) return b.riskLevel - a.riskLevel;
          return a.answerText.localeCompare(b.answerText);
        });
        this.studentList.set(items);
        this.totalStudentRisks.set(data?.count ?? items.length);
      });
  }

  getRiskColor(riskLevel: number): string {
    return getRiskColor(riskLevel);
  }

  getTextRiskColor(riskLevel: number): string {
    return getRiskTextColor(riskLevel);
  }

  isPollAvgQuestion(
    question: PollAvgQuestion | PollCountQuestion
  ): question is PollAvgQuestion {
    return question && 'averageAnswer' in question && 'averageRisk' in question;
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

  handleLoadCalled(event: EventLoad): void {
    this.pagination = { page: event.page, pageSize: event.pageSize };
    this.loadComponentsAndVariables();
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
}
