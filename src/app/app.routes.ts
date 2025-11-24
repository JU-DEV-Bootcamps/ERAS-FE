import { Routes } from '@angular/router';
import { CosmicLatteComponent } from '@modules/settings/cosmic-latte.component';
import { EvaluationProcessListComponent } from '@modules/lists/components/evaluacion-process/evaluation-process-list.component';
import { HomeComponent } from '@modules/home/home.component';
import { ImportAnswersComponent } from '@modules/imports/components/import-answers/import-answers.component';
import { ImportStudentsComponent } from '@modules/imports/components/import-students/import-students.component';
import { ListStudentsByPollComponent } from '@modules/lists/components/list-students-by-poll/list-students-by-poll.component';
import { LoginComponent } from './core/auth/login/login.component';
import { ProfileComponent } from './core/auth/profile/profile.component';
import { RiskStudentsComponent } from '@modules/risk-students/risk-students.component';
import { canActivateAuthRole } from '@core/auth/guards/auth-role.guard';
import { authGuard } from '@core/auth/guards/auth.guard';
import { SummaryHeatmapComponent } from '@modules/reports/components/summary-heatmap/summary-heatmap.component';
import { DynamicHeatmapComponent } from '@modules/reports/components/dynamic-heatmap/dynamic-heatmap.component';
import { PollsAnsweredComponent } from '@modules/reports/components/polls-answered/polls-answered.component';
import { LayoutComponent } from '@core/layout/layout.component';
import { StudentMonitoringPollsComponent } from '@modules/student-monitoring/student-monitoring-polls/student-monitoring-polls.component';
import { StudentMonitoringCohortsComponent } from '@modules/student-monitoring/student-monitoring-cohorts/student-monitoring-cohorts.component';
import { StudentMonitoringDetailsComponent } from '@modules/student-monitoring/student-monitoring-details/student-monitoring-details.component';
import { referralsResolver } from '@modules/supports-referrals/resolvers/referrals.resolver';
import { referralDetailsResolver } from '@modules/supports-referrals/resolvers/referrals-details.resolver';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'reports/summary-heatmap',
        component: SummaryHeatmapComponent,
        data: { breadcrumb: 'Summary Charts' },
      },
      {
        path: 'reports/polls-answered',
        component: PollsAnsweredComponent,
        data: { breadcrumb: 'Polls Answered' },
      },
      {
        path: 'reports/dynamic-charts',
        component: DynamicHeatmapComponent,
        data: { breadcrumb: 'Dynamic Charts' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { breadcrumb: 'Profile' },
      },
      {
        path: 'cosmic-latte',
        component: CosmicLatteComponent,
        data: { breadcrumb: 'Cosmic Latte' },
      },
      {
        path: 'heatmap-summary',
        component: SummaryHeatmapComponent,
        data: { breadcrumb: 'Heatmap Summary' },
      },
      {
        path: 'evaluation-process',
        component: EvaluationProcessListComponent,
        data: { breadcrumb: 'Evaluation Process' },
      },
      {
        path: 'import-answers',
        component: ImportAnswersComponent,
        data: { breadcrumb: 'Import Answers' },
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
      //Example to use guard with role
      {
        path: 'forbidden',
        component: ProfileComponent,
        canActivate: [canActivateAuthRole],
        data: { role: 'admin' },
      },
    ],
  },
];
