import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';

import { referralDetailsResolver } from '@modules/supports-referrals/resolvers/referrals-details.resolver';
import { referralsResolver } from '@modules/supports-referrals/resolvers/referrals.resolver';

import { CosmicLatteComponent } from '@modules/settings/cosmic-latte.component';
import { EvaluationProcessListComponent } from '@modules/lists/components/evaluacion-process/evaluation-process-list.component';
import { ImportPreviewComponent } from '@modules/imports/components/import-preview/import-preview.component';
import { LayoutComponent } from '@core/components/layout/layout.component';
import { ListStudentsByPollComponent } from '@modules/lists/components/list-students-by-poll/list-students-by-poll.component';
import { PollsAnsweredComponent } from '@modules/reports/components/polls-answered/polls-answered.component';
import { RiskStudentsComponent } from '@modules/risk-students/risk-students.component';
import { StudentMonitoringCohortsComponent } from '@modules/student-monitoring/student-monitoring-cohorts/student-monitoring-cohorts.component';
import { StudentMonitoringDetailsComponent } from '@modules/student-monitoring/student-monitoring-details/student-monitoring-details.component';
import { StudentMonitoringPollsComponent } from '@modules/student-monitoring/student-monitoring-polls/student-monitoring-polls.component';
import { SummaryChartsComponent } from '@modules/reports/components/summary-charts/summary-charts.component';
import { evaluationProcessesResolver } from '@modules/reports/resolvers/evaluation-processes.resolver';
import { ReportsComponent } from '@modules/reports/components/reports/reports.component';
import { HomeContainerComponent } from '@modules/home-v2/home-container.component';
import { AppRouteData } from '@core/models/route-data.model';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { featureFlagGuard } from '@core/components/feature-flags/feature-flag.guard';
import { DynamicChartsComponent } from '@modules/reports/components/dynamic-charts/dynamic-charts.component';
import { DynamicChartsV2Component } from '@modules/reports/components/dynamic-charts-v2/dynamic-charts-v2.component';
import { AssessmentsComponent } from '@modules/assessments/components/assessments.component';
import { RecentAlertsListComponent } from '@modules/lists/components/recent-alerts-list/recent-alerts-list.component';
import { SummaryChartsV2Component } from '@modules/reports/components/summary-charts-v2/summary-charts-v2.component';
import { AssessmentsContainerComponent } from '@modules/assessments/components/assesment-container/assessments-container.component';
<<<<<<< 768-fe---view-interventions-on-a-list
import { InterventionsComponent } from '@modules/assessments/components/interventions/interventions.component';
=======
import { StudentsContainerComponent } from '@modules/students/students-container.component';
>>>>>>> develop

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeContainerComponent,
        data: { headerTitle: 'Home' } satisfies AppRouteData,
      },
      {
        path: 'reports',
        canActivate: [featureFlagGuard(FEATURE_FLAGS.reportsV2)],
        component: ReportsComponent,
        data: { headerTitle: 'Reports' } satisfies AppRouteData,
        children: [
          { path: '', redirectTo: 'dynamic-charts', pathMatch: 'full' },
          {
            path: 'dynamic-charts',
            component: DynamicChartsV2Component,
            data: { headerTitle: 'Reports' } satisfies AppRouteData,
            resolve: { evaluations: evaluationProcessesResolver },
          },
          {
            path: 'summary-charts',
            component: SummaryChartsV2Component,
            data: { headerTitle: 'Reports' } satisfies AppRouteData,
          },
          {
            path: 'polls-answered',
            component: PollsAnsweredComponent,
            data: { headerTitle: 'Reports' } satisfies AppRouteData,
          },
        ],
      },
      {
        path: 'reports-v1',
        children: [
          { path: '', redirectTo: 'dynamic-charts', pathMatch: 'full' },
          {
            path: 'dynamic-charts',
            component: DynamicChartsComponent,
            resolve: { evaluations: evaluationProcessesResolver },
          },
          { path: 'summary-charts', component: SummaryChartsComponent },
          { path: 'polls-answered', component: PollsAnsweredComponent },
        ],
      },
      {
        path: 'cosmic-latte',
        component: CosmicLatteComponent,
        data: { breadcrumb: 'Cosmic Latte' },
      },
      {
        path: 'evaluation-process',
        children: [
          {
            path: '',
            component: EvaluationProcessListComponent,
            data: { breadcrumb: 'Evaluation Process' },
          },
          {
            path: 'import-preview',
            component: ImportPreviewComponent,
            data: { breadcrumb: 'Import Answers' },
          },
        ],
      },
      {
        path: 'list-students-by-poll',
        component: ListStudentsByPollComponent,
        data: { breadcrumb: 'Students List By Poll' },
      },
      {
        path: 'students',
        component: StudentsContainerComponent,
        data: {
          breadcrumb: 'Students List',
          headerTitle: 'Students',
        } satisfies AppRouteData,
      },
      {
        path: 'risk-students',
        component: RiskStudentsComponent,
        data: { breadcrumb: 'Risk Students' },
      },

      {
        path: 'assessments',
        component: AssessmentsContainerComponent,
        data: {
          breadcrumb: 'Assessments',
          headerTitle: 'Assessments',
        } satisfies AppRouteData,
        children: [
          { path: '', redirectTo: 'assessments', pathMatch: 'full' },
          {
            path: 'assessments',
            component: AssessmentsComponent,
            data: { headerTitle: 'Assessments' } satisfies AppRouteData,
          },
          {
            path: 'interventions',
            component: InterventionsComponent,
            data: { headerTitle: 'Assessments' } satisfies AppRouteData,
          },
        ],
      },

      {
        path: 'student-option',
        component: StudentMonitoringPollsComponent,
        data: { breadcrumb: 'Student Monitoring Polls' },
      },
      {
        path: 'student-option/:pollUuid/:lastVersion',
        component: StudentMonitoringCohortsComponent,
        data: { breadcrumb: 'Student Monitoring Cohorts' },
      },
      {
        path: 'student-option/:pollUuid/:lastVersion/:cohortId',
        component: StudentMonitoringDetailsComponent,
        data: { breadcrumb: 'Student Monitoring Details' },
      },
      {
        path: 'supports-referrals',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@modules/supports-referrals/referrals.component'),
            resolve: { referrals: referralsResolver },
          },
          {
            path: 'details/:id',
            loadComponent: () =>
              import('@modules/supports-referrals/components/referral-detail/referral-detail.component'),
            resolve: { referral: referralDetailsResolver },
            data: { breadcrumb: 'Referral Details' },
          },
        ],
        data: { breadcrumb: 'Referrals' },
      },
      {
        path: 'recent-alerts',
        component: RecentAlertsListComponent,
        data: { headerTitle: 'Recent Alerts' } satisfies AppRouteData,
      },
    ],
  },
];
