import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { AppComponent } from '../../shared/components/charts/summary-survey/summary-survey.component';
import { PieChartComponent } from '../../shared/components/charts/pie-chart/pie-chart.component';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIcon,
    AppComponent,
    PieChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  latestSurveyTitle = 'Encuesta de Caracterizacion';
  version = 'Latest';
  published = '10/10/2024';
  deadline = '01/03/2025';
}
