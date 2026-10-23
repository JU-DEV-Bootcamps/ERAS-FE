import { Routes } from '@angular/router';
import { AssessmentsComponent } from './components/assessments.component';
import { InterventionsComponent } from './components/interventions/interventions.component';
import { AssessmentsContainerComponent } from './components/assesment-container/assessments-container.component';
import { ROUTE_METADATA } from '@core/utils/routing/route-metadata';

export const ASSESSMENT_ROUTES: Routes = [
  {
    path: '',
    data: ROUTE_METADATA.ASSESSMENTS,
    component: AssessmentsContainerComponent,
    children: [
      {
        path: '',
        redirectTo: 'assessments',
        pathMatch: 'full',
      },
      {
        path: 'assessments',
        data: ROUTE_METADATA.ASSESSMENTS,
        component: AssessmentsComponent,
      },
      {
        path: 'interventions',
        data: ROUTE_METADATA.ASSESSMENTS,
        component: InterventionsComponent,
      },
    ],
  },
];
