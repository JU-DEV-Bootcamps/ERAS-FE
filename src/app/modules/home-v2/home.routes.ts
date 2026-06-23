import { Routes } from '@angular/router';
import { HomeContainerComponent } from './home-container.component';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeContainerComponent,
    data: {
      breadcrumb: 'Home',
      headerTitle: 'Home',
    },
  },
];
