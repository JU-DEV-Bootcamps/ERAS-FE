import { Routes } from '@angular/router';
import { CosmicLatteComponent } from './features/cosmic-latte/cosmic-latte.component';
import { EvaluationProcessListComponent } from './features/evaluation-process/evaluation-process-list/evaluation-process-list.component';
import { HomeComponent } from './features/home/home.component';
import { ImportAnswersComponent } from './features/import-answers/import-answers.component';
import { ImportStudentsComponent } from './features/import-students/import-students.component';
import { ListStudentsByPollComponent } from './features/list-students-by-poll/list-students-by-poll.component';
import { LoginComponent } from './features/login/login.component';
import { ProfileComponent } from './features/profile/profile.component';
import { HeatMapComponent } from './features/reports/heat-map/heat-map.component';
import { SummaryHeatmapComponent } from './features/reports/summary-heatmap/summary-heatmap.component';
import { RiskStudentsComponent } from './features/risk-students/risk-students.component';
import { StudentDetailOptionComponent } from './features/student/student-detail-option/student-detail-option.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { canActivateAuthRole } from './shared/guards/auth-role.guard';
import { authGuard } from './shared/guards/auth.guard';
import { StudentsRiskComponent } from './features/cohort/students-risk/students-risk.component';
import { DynamicHeatmapComponent } from './modules/reports/views/dynamic-heatmap/dynamic-heatmap.component';
import { PollsAnsweredComponent } from './modules/reports/views/polls-answered/polls-answered.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'reports2/dynamic-heatmap',
        component: HeatMapComponent,
        data: { breadcrumb: 'Dynamic Heatmap' },
      },
      {
        path: 'reports/summary-heatmap',
        component: StudentsRiskComponent,
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
        path: 'student-option',
        component: StudentDetailOptionComponent,
        data: { breadcrumb: 'Student Monitoring' },
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
