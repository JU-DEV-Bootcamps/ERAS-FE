import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';

import { LayoutComponent } from '@core/components/layout/layout.component';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { featureFlagGuard } from '@core/components/feature-flags/feature-flag.guard';
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
        data: ROUTE_METADATA.COSMIC_LATTE,
        loadComponent: () =>
          import('./modules/settings/cosmic-latte.component').then(
            m => m.CosmicLatteComponent
          ),
      },
      {
        path: 'evaluation-process',
        loadChildren: () =>
          import('./modules/lists/components/evaluacion-process/evaluation-process.routes').then(
            m => m.EVALUATION_PROCESSES
          ),
      },
      {
        path: 'list-students-by-poll',
        data: ROUTE_METADATA.LIST_STUDENTS,
        loadComponent: () =>
          import('./modules/lists/components/list-students-by-poll/list-students-by-poll.component').then(
            c => c.ListStudentsByPollComponent
          ),
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
        path: 'assessments',
        loadChildren: () =>
          import('./modules/assessments/assessments.routes').then(
            m => m.ASSESSMENT_ROUTES
          ),
      },
      {
        path: 'recent-alerts',
        data: ROUTE_METADATA.RECENT_ALERTS,
        loadComponent: () =>
          import('./modules/lists/components/recent-alerts-list/recent-alerts-list.component').then(
            c => c.RecentAlertsListComponent
          ),
      },
      {
        path: '_unused',
        loadChildren: () =>
          import('./modules/_unused/unused.routes').then(m => m.UNUSED_ROUTES),
      },
    ],
  },
];
