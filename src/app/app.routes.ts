import { Routes } from '@angular/router';
import { ThemePreviewComponent } from './shared/components/theme-preview/theme-preview.component';
import { LoginComponent } from './features/authentication/pages/login/login.component';

export const routes: Routes = [
  { path: 'preview', component: ThemePreviewComponent },
  { path: 'login', component: LoginComponent },
];
