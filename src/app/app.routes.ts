import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { ProfileComponent } from './features/profile/profile.component';
import { CosmicLatteComponent } from './features/cosmic-latte/cosmic-latte.component';
import { ImportAnswersComponent } from './features/import-answers/import-answers.component';
import { ImportStudentsComponent } from './features/import-students/import-students.component';
import { canActivateAuthRole } from './shared/guards/auth-role.guard';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './shared/guards/auth.guard';
import { ListStudentsByPollComponent } from './features/list-students-by-poll/list-students-by-poll.component';
import { SummaryHeatmapComponent } from './features/reports/summary-heatmap/summary-heatmap.component';
import { ListPollInstancesByFiltersComponent } from './features/list-poll-instances-by-filters/list-poll-instances-by-filters.component';
import { StudentDetailComponent } from './features/student-detail/student-detail.component';
import { HomeComponent } from './features/home/home.component';
import { CohortComponent } from './features/cohort/cohort/cohort.component';
import { EvaluationProcessListComponent } from './features/evaluation-process/evaluation-process-list/evaluation-process-list.component';
import { StudentDetailOptionComponent } from './features/student/student-detail-option/student-detail-option.component';
// import { HeatMapComponent } from './features/reports/heat-map.component';
import { HeatMapComponent } from './features/reports/heat-map/heat-map.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      {
        path: 'cosmic-latte',
        component: CosmicLatteComponent,
      },
      {
        path: 'student-option',
        component: StudentDetailOptionComponent,
      },
      {
        path: 'heat-map',
        component: HeatMapComponent,
      },
      {
        path: 'heat-map-summary',
        component: SummaryHeatmapComponent,
      },
      {
        path: 'evaluation-process',
        component: EvaluationProcessListComponent,
      },
      {
        path: 'import-answers',
        component: ImportAnswersComponent,
      },
      {
        path: 'import-students',
        component: ImportStudentsComponent,
      },
      {
        path: 'cohort',
        component: CohortComponent,
      },
      {
        path: 'list-students-by-poll',
        component: ListStudentsByPollComponent,
      },
      {
        path: 'list-polls-by-filters',
        component: ListPollInstancesByFiltersComponent,
      },
      {
        path: 'student-details/:studentId',
        component: StudentDetailComponent,
        canActivate: [authGuard],
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
