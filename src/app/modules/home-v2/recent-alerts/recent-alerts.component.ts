import { Component, inject } from '@angular/core';
import { ListComponent } from '@shared/components/list/list.component';
import { Column } from '@shared/components/list/types/column';
import { Pagination } from '@core/services/interfaces/server.type';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { RecentAlertsResponse } from '@core/models/recent-alerts-response.model';
import {
  STATUS_COLORS,
  STATUS_EVALUATIONS,
  STATUS_LABEL_COLORS,
} from '@core/constants/StatusEvaluation';
import {
  ALERT_RISK_COLORS,
  ALERT_RISK_LABEL_COLORS,
} from '@core/constants/alertRiskLevel';

@Component({
  selector: 'app-recent-alerts',
  imports: [ListComponent],
  templateUrl: './recent-alerts.component.html',
  styleUrl: './recent-alerts.component.scss',
})
export class RecentAlertsComponent {
  columns: Column<RecentAlertsResponse>[] = [
    {
      key: 'studentId',
      label: 'student Id',
    },
    // {
    //   key: 'studentName',
    //   label: 'Student name',
    // },
    {
      key: 'category',
      label: 'category',
    },
    {
      key: 'date',
      label: 'date',
      // pipe: new RangeTimestampPipe(),
    },
  ];
  columnTemplates: Column<RecentAlertsResponse>[] = [
    {
      key: 'riskLevel',
      label: 'risk Level',
    },
    {
      key: 'status',
      label: 'status',
    },
  ];
  alertsList: RecentAlertsResponse[] = [];
  totalAlerts = 0;
  actionDatas = [];
  isLoading = false;
  evaluationDetailsService = inject(EvaluationDetailsService);
  pagination: Pagination = {
    page: 0,
    pageSize: 5,
  };

  handleLoadCalled() {
    this.isLoading = true;
    this.evaluationDetailsService
      .getRecentAlerts(this.pagination)
      .subscribe(data => {
        this.alertsList = this.normalizeStatus(data.items);
        this.totalAlerts = data.count;
        this.isLoading = false;
      });
  }

  private normalizeStatus(
    data: RecentAlertsResponse[]
  ): RecentAlertsResponse[] {
    data.forEach((alert: RecentAlertsResponse) => {
      alert.status = STATUS_EVALUATIONS[alert.status];
    });
    console.log('hiii', data);
    return data;
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] ?? STATUS_COLORS['default'];
  }

  getStatusLabelColor(status: string): string {
    return STATUS_LABEL_COLORS[status] ?? STATUS_LABEL_COLORS['default'];
  }

  getRiskLevelColor(level: string): string {
    return ALERT_RISK_COLORS[level] ?? ALERT_RISK_COLORS['default'];
  }

  getRiskLevelLabelColor(level: string): string {
    return ALERT_RISK_LABEL_COLORS[level] ?? ALERT_RISK_LABEL_COLORS['default'];
  }
}
