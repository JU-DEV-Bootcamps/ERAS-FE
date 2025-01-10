import { Routes } from '@angular/router';
import { ThemePreviewComponent } from './shared/components/theme-preview/theme-preview.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { ProfileComponent } from './shared/components/profile/profile.component';
import { CosmicLatteComponent } from './shared/components/cosmic-latte/cosmic-latte.component';
import { HeatMapComponent } from './shared/components/heat-map/components/heat-map.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'preview', component: ThemePreviewComponent },
      { path: 'cosmic-latte', component: CosmicLatteComponent},
      { path: 'heat-map', component: HeatMapComponent },
    ],
  },
];
