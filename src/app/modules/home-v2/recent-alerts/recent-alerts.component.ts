import { Component, inject } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { TableWithActionsComponent } from '@shared/components/table-with-actions/table-with-actions.component';
import { BadgeStatusComponent } from '@modules/lists/components/evaluacion-process/badge-status/badge-status.component';
import { ListComponent } from '@shared/components/list/list.component';
import { Column } from '@shared/components/list/types/column';
import { RecentAlertsModel } from '@core/models/recent-alerts.model';
import { RangeTimestampPipe } from '@shared/pipes/range-timestamp.pipe';
import { Pagination } from '@core/services/interfaces/server.type';
// import { EventLoad } from '@core/models/load';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';

@Component({
  selector: 'app-recent-alerts',
  imports: [
    TableComponent,
    TableWithActionsComponent,
    BadgeStatusComponent,
    ListComponent,
  ],
  templateUrl: './recent-alerts.component.html',
  styleUrl: './recent-alerts.component.scss',
})
export class RecentAlertsComponent {
  data = ['hi', 'thunder'];
  columns: Column<RecentAlertsModel>[] = [
    {
      key: 'id',
      label: 'Id',
    },
    {
      key: 'studentId',
      label: 'student Id',
    },
    {
      key: 'riskLevel',
      label: 'risk Level',
    },
    {
      key: 'category',
      label: 'category',
    },
    {
      key: 'date',
      label: 'date',
      pipe: new RangeTimestampPipe(),
    },
    {
      key: 'status',
      label: 'status',
    },
  ];
  alertsList: RecentAlertsModel[] = [];
  totalAlerts = 0;
  isLoading = false;
  evaluationDetailsService = inject(EvaluationDetailsService);
  pagination: Pagination = {
    page: 0,
    pageSize: 5,
  };

  // handleLoadCalled(event: EventLoad) {
  //   this.isLoading = true;
  //   this.evaluationDetailsService.getRecentAlerts(this.pagination).subscribe(response => {

  //   })
  // }
}
