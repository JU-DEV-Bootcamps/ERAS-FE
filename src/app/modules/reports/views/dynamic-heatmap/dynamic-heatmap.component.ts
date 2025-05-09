import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { printReportInfo } from '../../exportReport.util';
import { PdfService } from '../../../../core/services/exports/pdf.service';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { HeatMapService } from '../../../../core/services/api/heat-map.service';
import { fillDefaultData } from '../../../../features/reports/heat-map/util/heat-map.util';
import { ChartOptionsColorsCount } from '../../../../features/reports/constants/heat-map';
import { MatIcon } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dynamic-heatmap',
  imports: [
    PollFiltersComponent,
    EmptyDataComponent,
    MatIcon,
    NgApexchartsModule,
  ],
  templateUrl: './dynamic-heatmap.component.html',
  styleUrl: './dynamic-heatmap.component.css',
})
export class DynamicHeatmapComponent {
  public isGeneratingPDF = false;
  chartOption = { ...ChartOptionsColorsCount };
  pdfService = inject(PdfService);
  heatmapService = inject(HeatMapService);

  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;

  constructor(private snackBar: MatSnackBar) {}

  generateHeatMap(pollInstanceUuid: string, variablesIds: number[]) {
    this.heatmapService
      .generateHeatmap(pollInstanceUuid, variablesIds)
      .subscribe(data => {
        const heatmap = fillDefaultData([...data]);

        const serie = heatmap.map(d => ({
          data: d.data.sort((a, b) => a.y - b.y),
          name: d.name,
        }));

        this.chartOption.series = serie;
      });
  }

  exportReportPdf() {
    if (this.isGeneratingPDF) return;
    this.isGeneratingPDF = true;
    const snackBarRef = this.snackBar.open('Generating PDF...', 'Close', {
      duration: 10000,
      panelClass: ['custom-snackbar'],
    });

    setTimeout(() => {
      const clonedElement = printReportInfo(this.mainContainer);
      document.body.appendChild(clonedElement);

      this.pdfService.exportToPDF(clonedElement, `report-detail.pdf`);

      setTimeout(() => {
        snackBarRef.dismiss();

        this.snackBar.open('PDF generated successfully', 'OK', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
        });
        this.isGeneratingPDF = false;
        document.body.removeChild(clonedElement);
      }, 2000);
    }, 10000);
  }
}
