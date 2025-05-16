import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideKeycloak } from 'keycloak-angular';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { keycloakHttpInterceptor } from './core/utilities/keycloak-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: environment.keycloak,
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([keycloakHttpInterceptor])),
    provideAnimationsAsync(),
  ],
};
