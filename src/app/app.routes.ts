import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';

import { referralDetailsResolver } from '@modules/supports-referrals/resolvers/referrals-details.resolver';
import { referralsResolver } from '@modules/supports-referrals/resolvers/referrals.resolver';

import { CosmicLatteComponent } from '@modules/settings/cosmic-latte.component';
import { DynamicChartsComponent } from '@modules/reports/components/dynamic-charts/dynamic-charts.component';
import { EvaluationProcessListComponent } from '@modules/lists/components/evaluacion-process/evaluation-process-list.component';
import { HomeComponent } from '@modules/home/home.component';
import { ImportPreviewComponent } from '@modules/imports/components/import-preview/import-preview.component';
import { ImportStudentsComponent } from '@modules/imports/components/import-students/import-students.component';
import { LayoutComponent } from '@core/components/layout/layout.component';
import { ListStudentsByPollComponent } from '@modules/lists/components/list-students-by-poll/list-students-by-poll.component';
import { PollsAnsweredComponent } from '@modules/reports/components/polls-answered/polls-answered.component';
import { RiskStudentsComponent } from '@modules/risk-students/risk-students.component';
import { StudentMonitoringCohortsComponent } from '@modules/student-monitoring/student-monitoring-cohorts/student-monitoring-cohorts.component';
import { StudentMonitoringDetailsComponent } from '@modules/student-monitoring/student-monitoring-details/student-monitoring-details.component';
import { StudentMonitoringPollsComponent } from '@modules/student-monitoring/student-monitoring-polls/student-monitoring-polls.component';
import { SummaryChartsComponent } from '@modules/reports/components/summary-charts/summary-charts.component';

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
      { path: 'home', component: HomeComponent },
      {
        path: 'reports/summary-charts',
        component: SummaryChartsComponent,
        data: { breadcrumb: 'Summary Charts' },
      },
      {
        path: 'reports/polls-answered',
        component: PollsAnsweredComponent,
        data: { breadcrumb: 'Polls Answered' },
      },
      {
        path: 'reports/dynamic-charts',
        component: DynamicChartsComponent,
        data: { breadcrumb: 'Dynamic Charts' },
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
        path: 'import-students',
        component: ImportStudentsComponent,
        data: { breadcrumb: 'Import Students' },
      },
      {
        path: 'list-students-by-poll',
        component: ListStudentsByPollComponent,
        data: { breadcrumb: 'Students List By Poll' },
      },
      {
        path: 'risk-students',
        component: RiskStudentsComponent,
        canActivate: [authGuard],
        data: { breadcrumb: 'Risk Students' },
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
              import(
                '@modules/supports-referrals/components/referral-detail/referral-detail.component'
              ),
            resolve: { referral: referralDetailsResolver },
            data: { breadcrumb: 'Referral Details' },
          },
        ],
        data: { breadcrumb: 'Referrals' },
      },
    ],
  },
];
