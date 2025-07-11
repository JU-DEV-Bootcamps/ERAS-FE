import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { ActivatedRoute } from '@angular/router';
import { GetChartOptions } from '../../cohort/util/heat-map-config';
import { MatDialog } from '@angular/material/dialog';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '../../heat-map/modal-question-details/modal-question-details.component';
import { PollAvgQuestion } from '../../../core/models/summary.model';
import { ReportService } from '../../../core/services/api/report.service';
import { ComponentValueType } from '../../heat-map/types/risk-students-detail.type';

@Component({
  selector: 'app-summary-heatmap',
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './summary-heatmap.component.html',
  styleUrl: './summary-heatmap.component.css',
})
export class SummaryHeatmapComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly dialog = inject(MatDialog);
  public chartOptions: ApexOptions = {};
  private pollUuid = '';
  private route = inject(ActivatedRoute);
  private cohortId: number[] = [];

  isLoading = true;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cohortId = params['cohortId'] || [];
      this.pollUuid = params['pollUuid'] || '0';
    });

    this.reportService
      .getAvgPoolReport(this.pollUuid, this.cohortId, true)
      .subscribe(res => {
        this.isLoading = false;
        const reportSeries = this.reportService.getHMSeriesFromAvgReport(
          res.body
        );
        const serie = this.reportService.regroupSummaryByColor(reportSeries);
        this.chartOptions = GetChartOptions(
          `Risk Heatmap - ${this.cohortId}-${this.pollUuid}`,
          serie,
          (x, y) => {
            const compReport = res.body.components[y];
            const selectedQuestion = compReport.questions[x];

            this.openDetailsModal(selectedQuestion, compReport.description);
          }
        );
      });
  }

  openDetailsModal(
    question: PollAvgQuestion,
    componentName: ComponentValueType
  ): void {
    const data: SelectedHMData = {
      cohortId: this.cohortId.join(','),
      pollUuid: this.pollUuid,
      componentName,
      question,
    };
    this.dialog.open(ModalQuestionDetailsComponent, { data });
  }
}
