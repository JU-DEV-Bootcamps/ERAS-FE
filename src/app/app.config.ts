import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { keycloakHttpInterceptor } from '@core/interceptors/keycloak-interceptor';
import { AuthService } from '@core/services/access/access.service';
import Keycloak from 'keycloak-js';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: Keycloak,
      useFactory: () => new Keycloak(environment.keycloak),
    },
    provideAppInitializer(async () => {
      const authService = inject(AuthService);
      const featureFlags = inject(FeatureFlagsService);

      await authService.init();

      if (authService.isAuthenticated()) {
        await firstValueFrom(featureFlags.loadFlags());
      }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([keycloakHttpInterceptor])),
    provideAnimationsAsync(),
  ],
};
