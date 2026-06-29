import { Routes } from '@angular/router';
import { DynamicChartsV2Component } from './components/dynamic-charts-v2/dynamic-charts-v2.component';
import { PollsAnsweredComponent } from './components/polls-answered/polls-answered.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SummaryChartsV2Component } from './components/summary-charts-v2/summary-charts-v2.component';
import { evaluationProcessesResolver } from './resolvers/evaluation-processes.resolver';
import { DynamicChartsComponent } from './components/dynamic-charts/dynamic-charts.component';
import { SummaryChartsComponent } from './components/summary-charts/summary-charts.component';
import { AppRouteData } from '@core/models/route-data.model';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: ReportsComponent,
    data: {
      breadcrumb: 'Reports',
      headerTitle: 'Reports',
    } satisfies AppRouteData,
    children: [
      {
        path: '',
        redirectTo: 'dynamic-charts',
        pathMatch: 'full',
      },
      {
        path: 'dynamic-charts',
        component: DynamicChartsV2Component,
        resolve: {
          evaluations: evaluationProcessesResolver,
        },
      },
      {
        path: 'summary-charts',
        component: SummaryChartsV2Component,
      },
      {
        path: 'polls-answered',
        component: PollsAnsweredComponent,
      },
    ],
  },
];

export const REPORTS_ROUTES_V1: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dynamic-charts',
        pathMatch: 'full',
      },
      {
        path: 'dynamic-charts',
        component: DynamicChartsComponent,
        resolve: {
          evaluations: evaluationProcessesResolver,
        },
      },
      {
        path: 'summary-charts',
        component: SummaryChartsComponent,
      },
      {
        path: 'polls-answered',
        component: PollsAnsweredComponent,
      },
    ],
  },
];
