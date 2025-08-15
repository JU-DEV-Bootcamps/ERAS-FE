import { Routes } from '@angular/router';
import { CosmicLatteComponent } from './features/cosmic-latte/cosmic-latte.component';
import { EvaluationProcessListComponent } from './modules/lists/views/evaluation-process-list/evaluation-process-list.component';
import { HomeComponent } from './features/home/home.component';
import { ImportAnswersComponent } from './features/import-answers/import-answers.component';
import { ImportStudentsComponent } from './features/import-students/import-students.component';
import { ListStudentsByPollComponent } from './features/list-students-by-poll/list-students-by-poll.component';
import { LoginComponent } from './features/login/login.component';
import { ProfileComponent } from './features/profile/profile.component';
import { RiskStudentsComponent } from './features/risk-students/risk-students.component';
import { canActivateAuthRole } from './shared/guards/auth-role.guard';
import { authGuard } from './shared/guards/auth.guard';
import { SummaryHeatmapComponent } from './modules/reports/views/summary-heatmap/summary-heatmap.component';
import { DynamicHeatmapComponent } from './modules/reports/views/dynamic-heatmap/dynamic-heatmap.component';
import { PollsAnsweredComponent } from './modules/reports/views/polls-answered/polls-answered.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { StudentMonitoringPollsComponent } from './features/student/student-monitoring-polls/student-monitoring-polls.component';
import { StudentMonitoringCohortsComponent } from './features/student/student-monitoring-cohorts/student-monitoring-cohorts.component';
import { StudentMonitoringDetailsComponent } from './features/student/student-monitoring-details/student-monitoring-details.component';
import { referralsResolver } from './modules/supports-referrals/referrals.resolver';

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
        data: { breadcrumb: 'Summary Heatmap' },
      },
      {
        path: 'reports/polls-answered',
        component: PollsAnsweredComponent,
        data: { breadcrumb: 'Polls Answered' },
      },
      {
        path: 'reports/dynamic-heatmap',
        component: DynamicHeatmapComponent,
        data: { breadcrumb: 'Dynamic Heatmap' },
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
              import('./modules/supports-referrals/referrals.component'),
            resolve: { referrals: referralsResolver },
          },
        ],
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
