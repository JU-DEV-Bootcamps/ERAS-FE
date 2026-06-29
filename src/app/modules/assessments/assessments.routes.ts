import { Routes } from '@angular/router';
import { AssessmentsComponent } from './components/assessments.component';
import { InterventionsComponent } from './components/interventions/interventions.component';

export const ASSESSMENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'assessments',
        pathMatch: 'full',
      },
      {
        path: 'assessments',
        component: AssessmentsComponent,
      },
      {
        path: 'interventions',
        component: InterventionsComponent,
      },
    ],
  },
];
