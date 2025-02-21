import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { ProfileComponent } from './features/profile/profile.component';
import { CosmicLatteComponent } from './features/cosmic-latte/cosmic-latte.component';
import { HeatMapComponent } from './features/reports/heat-map.component';
import { ImportAnswersComponent } from './features/import-answers/import-answers.component';
import { ImportStudentsComponent } from './features/import-students/import-students.component';
import { canActivateAuthRole } from './shared/guards/auth-role.guard';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './shared/guards/auth.guard';
import { ListPollsByCohortComponent } from './features/list-polls-by-cohort/list-polls-by-cohort.component';
import { ListStudentsByPollComponent } from './features/list-students-by-poll/list-students-by-poll.component';
import { SummaryHeatmapComponent } from './features/reports/summary-heatmap/summary-heatmap.component';
import { ListPollInstancesByLastDaysComponent } from './features/list-poll-instances-by-lastdays/list-poll-instances-by-lastdays.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: ProfileComponent },
      {
        path: 'cosmic-latte',
        component: CosmicLatteComponent,
        canActivate: [authGuard],
      },
      {
        path: 'heat-map',
        component: HeatMapComponent,
        canActivate: [authGuard],
      },
      {
        path: 'heat-map-summary',
        component: SummaryHeatmapComponent,
        canActivate: [authGuard],
      },
      {
        path: 'import-answers',
        component: ImportAnswersComponent,
        canActivate: [authGuard],
      },
      {
        path: 'list-polls-by-cohort',
        component: ListPollsByCohortComponent,
        canActivate: [authGuard],
      },
      {
        path: 'import-students',
        component: ImportStudentsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'list-students-by-poll',
        component: ListStudentsByPollComponent,
        canActivate: [authGuard],
      },
      {
        path: 'list-polls-by-lastDays',
        component: ListPollInstancesByLastDaysComponent,
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
