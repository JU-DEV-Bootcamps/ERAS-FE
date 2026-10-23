import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import Keycloak from 'keycloak-js';
import { from, switchMap, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(Keycloak);
  private isInitialized = false;
  private isLoggingOut = false;
  private TOKEN_KEY = 'keycloak_token';
  // TODO: save tokens on a more secure place, e.g. httpOnly cookies
  private REFRESH_TOKEN_KEY = 'keycloak_refreshToken';
  private UPDATE_TOKEN_TIME = 15;

  private REDIRECT_URI = environment.production
    ? window.location.origin + '/'
    : '';

  async init() {
    if (this.isInitialized) return;

    this.keycloak.onAuthLogout = this.onAuthLogout;
    this.keycloak.onTokenExpired = this.onTokenExpired;
    this.keycloak.onAuthRefreshError = this.onAuthRefreshError;

    try {
      const authenticated = await this.keycloak.init({
        onLoad: undefined,
        token: sessionStorage.getItem(this.TOKEN_KEY) || undefined,
        refreshToken:
          sessionStorage.getItem(this.REFRESH_TOKEN_KEY) || undefined,
        redirectUri: this.REDIRECT_URI,
        checkLoginIframe: false,
      });

      if (authenticated) {
        sessionStorage.setItem(this.TOKEN_KEY, this.keycloak.token!);
        sessionStorage.setItem(
          this.REFRESH_TOKEN_KEY,
          this.keycloak.refreshToken!
        );
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Keycloak', error);
    }
  }

  async login() {
    if (!this.keycloak.token) {
      this.keycloak.login({
        redirectUri: this.REDIRECT_URI,
      });
    }
  }

  logout() {
    if (this.isLoggingOut) return;

    if (!this.keycloak.authenticated) {
      this.clearTokens();
      return;
    }

    this.isLoggingOut = true;
    this.clearTokens();
    this.keycloak.logout();
  }

  async updateToken(): Promise<boolean> {
    try {
      const refreshed = await this.keycloak.updateToken(this.UPDATE_TOKEN_TIME);

      if (refreshed) {
        this.storeTokens();
      } else {
        this.clearTokens();
      }

      return refreshed;
    } catch (error) {
      console.error(
        'An error has ocured while refreshing the access token',
        error
      );
      this.clearTokens();
      return false;
    }
  }

  getAccessToken() {
    return this.keycloak.token;
  }

  getRefreshToken() {
    return this.keycloak.refreshToken;
  }

  handleRefresh(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> {
    return from(this.updateToken()).pipe(
      switchMap(isRefreshed => {
        if (isRefreshed) {
          const accessToken = this.getAccessToken();
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${accessToken}` },
          });
          return next(retryReq);
        }

        this.logout();
        return next(req);
      })
    );
  }

  isAuthenticated() {
    return !!this.keycloak.authenticated;
  }

  storeTokens() {
    const keycloakToken = this.keycloak.token;
    const keycloakRefreshToken = this.keycloak.refreshToken;

    if (keycloakToken) {
      sessionStorage.setItem(this.TOKEN_KEY, keycloakToken);
    } else {
      console.error('No keycloak token to store');
    }
    if (keycloakRefreshToken) {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, keycloakRefreshToken);
    } else {
      console.error('No keycloak refresh token to store');
    }
  }

  clearTokens() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private onAuthLogout = () => {
    this.clearTokens();
  };

  private onTokenExpired = () => {
    this.updateToken();
  };

  private onAuthRefreshError = () => {
    this.clearTokens();
    this.logout();
  };
}
