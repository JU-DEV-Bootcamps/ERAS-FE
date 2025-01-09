import { Routes } from '@angular/router';
import { ThemePreviewComponent } from './shared/components/theme-preview/theme-preview.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { ProfileComponent } from './shared/components/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'preview', component: ThemePreviewComponent },
    ],
  },
];
