import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { environment } from '../environments/environment.development';
import { keycloakHttpInterceptor } from './core/utilities/keycloak-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        lang: 'en',
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.clientId),
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          console.error(error);
        },
      },
    },
    provideHttpClient(
        withInterceptors([keycloakHttpInterceptor]),
        withFetch()
    ),
    provideAnimationsAsync(),
  ],
};
