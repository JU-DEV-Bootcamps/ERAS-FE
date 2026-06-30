import { Routes } from '@angular/router';
import { HomeContainerComponent } from './home-container.component';
import { ROUTE_METADATA } from '@core/utils/routing/route-metadata';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeContainerComponent,
    data: ROUTE_METADATA.HOME,
  },
];
