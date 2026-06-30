import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';

import { referralDetailsResolver } from '@modules/supports-referrals/resolvers/referrals-details.resolver';
import { referralsResolver } from '@modules/supports-referrals/resolvers/referrals.resolver';

import { CosmicLatteComponent } from '@modules/settings/cosmic-latte.component';
import { EvaluationProcessListComponent } from '@modules/lists/components/evaluacion-process/evaluation-process-list.component';
import { ImportPreviewComponent } from '@modules/imports/components/import-preview/import-preview.component';
import { LayoutComponent } from '@core/components/layout/layout.component';
import { ListStudentsByPollComponent } from '@modules/lists/components/list-students-by-poll/list-students-by-poll.component';
import { RiskStudentsComponent } from '@modules/risk-students/risk-students.component';
import { StudentMonitoringCohortsComponent } from '@modules/student-monitoring/student-monitoring-cohorts/student-monitoring-cohorts.component';
import { StudentMonitoringDetailsComponent } from '@modules/student-monitoring/student-monitoring-details/student-monitoring-details.component';
import { StudentMonitoringPollsComponent } from '@modules/student-monitoring/student-monitoring-polls/student-monitoring-polls.component';
import { AppRouteData } from '@core/models/route-data.model';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { featureFlagGuard } from '@core/components/feature-flags/feature-flag.guard';
import { RecentAlertsListComponent } from '@modules/lists/components/recent-alerts-list/recent-alerts-list.component';
import { AssessmentsContainerComponent } from '@modules/assessments/components/assesment-container/assessments-container.component';
import { ROUTE_METADATA } from '@core/utils/routing/route-metadata';

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
        loadChildren: () =>
          import('./modules/home-v2/home.routes').then(m => m.HOME_ROUTES),
      },
      {
        path: 'reports',
        canActivate: [featureFlagGuard(FEATURE_FLAGS.reportsV2)],
        data: {
          breadcrumb: 'Reports',
          headerTitle: 'Reports',
        } satisfies AppRouteData,
        loadChildren: () =>
          import('./modules/reports/reports.routes').then(
            m => m.REPORTS_ROUTES
          ),
      },
      {
        path: 'reports-v1',
        loadChildren: () =>
          import('./modules/reports/reports.routes').then(
            m => m.REPORTS_ROUTES_V1
          ),
      },
      {
        path: 'cosmic-latte',
        component: CosmicLatteComponent,
        data: ROUTE_METADATA.COSMIC_LATTE,
      },
      {
        path: 'evaluation-process',
        children: [
          {
            path: '',
            component: EvaluationProcessListComponent,
            data: ROUTE_METADATA.EVALUATION_PROCESS,
          },
          {
            path: 'import-preview',
            component: ImportPreviewComponent,
            data: ROUTE_METADATA.IMPORT_PREVIEW,
          },
        ],
      },
      {
        path: 'list-students-by-poll',
        component: ListStudentsByPollComponent,
        data: ROUTE_METADATA.LIST_STUDENTS,
      },
      {
        path: 'students',
        data: ROUTE_METADATA.STUDENTS,
        loadComponent: () =>
          import('./modules/students/students-container.component').then(
            c => c.StudentsContainerComponent
          ),
      },
      {
        path: 'risk-students',
        component: RiskStudentsComponent,
        data: { breadcrumb: 'Risk Students' },
      },
      {
        path: 'assessments',
        component: AssessmentsContainerComponent,
        data: ROUTE_METADATA.ASSESSMENTS,
        loadChildren: () =>
          import('./modules/assessments/assessments.routes').then(
            m => m.ASSESSMENT_ROUTES
          ),
      },
      {
        path: 'recent-alerts',
        component: RecentAlertsListComponent,
        data: { headerTitle: 'Recent Alerts' } satisfies AppRouteData,
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
    ],
  },
];
