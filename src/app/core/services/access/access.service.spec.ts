import { TestBed } from '@angular/core/testing';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import Keycloak from 'keycloak-js';
import { AuthService } from './access.service';

interface KeycloakMock {
  token?: string;
  refreshToken?: string;
  authenticated?: boolean;
  init: jasmine.Spy<
    (options?: Keycloak.KeycloakInitOptions) => Promise<boolean>
  >;
  login: jasmine.Spy<
    (options?: Keycloak.KeycloakLoginOptions) => Promise<void>
  >;
  logout: jasmine.Spy<
    (options?: Keycloak.KeycloakLogoutOptions) => Promise<void>
  >;
  updateToken: jasmine.Spy<(minValidity?: number) => Promise<boolean>>;
  onAuthLogout?: () => void;
  onTokenExpired?: () => void;
  onAuthRefreshError?: () => void;
}

describe('AuthService', () => {
  let service: AuthService;
  let keycloakMock: KeycloakMock;

  const TOKEN_KEY = 'keycloak_token';
  const REFRESH_TOKEN_KEY = 'keycloak_refreshToken';

  beforeEach(() => {
    sessionStorage.clear();

    keycloakMock = {
      token: undefined,
      refreshToken: undefined,
      authenticated: false,
      init: jasmine.createSpy('init').and.resolveTo(false),
      login: jasmine.createSpy('login').and.resolveTo(),
      logout: jasmine.createSpy('logout').and.resolveTo(),
      updateToken: jasmine.createSpy('updateToken').and.resolveTo(false),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Keycloak, useValue: keycloakMock as unknown as Keycloak },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should initialize Keycloak and store tokens when authenticated', async () => {
      keycloakMock.token = 'mock-access-token';
      keycloakMock.refreshToken = 'mock-refresh-token';
      keycloakMock.init.and.resolveTo(true);

      sessionStorage.setItem(TOKEN_KEY, 'stored-token');
      sessionStorage.setItem(REFRESH_TOKEN_KEY, 'stored-refresh');

      await service.init();

      expect(keycloakMock.init).toHaveBeenCalledWith(
        jasmine.objectContaining({
          token: 'stored-token',
          refreshToken: 'stored-refresh',
          checkLoginIframe: false,
        })
      );
      expect(sessionStorage.getItem(TOKEN_KEY)).toBe('mock-access-token');
      expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe(
        'mock-refresh-token'
      );
      expect(service['isInitialized']).toBeTrue();
    });

    it('should pass undefined tokens when sessionStorage is empty and not store tokens when unauthenticated', async () => {
      keycloakMock.init.and.resolveTo(false);

      await service.init();

      expect(keycloakMock.init).toHaveBeenCalledWith(
        jasmine.objectContaining({
          token: undefined,
          refreshToken: undefined,
        })
      );
      expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
      expect(service['isInitialized']).toBeTrue();
    });

    it('should return early when already initialized', async () => {
      service['isInitialized'] = true;

      await service.init();

      expect(keycloakMock.init).not.toHaveBeenCalled();
    });

    it('should catch error and log when keycloak.init throws', async () => {
      spyOn(console, 'error');
      const initError = new Error('Init failed');
      keycloakMock.init.and.rejectWith(initError);

      await service.init();

      expect(console.error).toHaveBeenCalledWith(
        'Error initializing Keycloak',
        initError
      );
      expect(service['isInitialized']).toBeFalse();
    });

    it('should register event listener callbacks on keycloak', async () => {
      await service.init();

      expect(keycloakMock.onAuthLogout).toBeDefined();
      expect(keycloakMock.onTokenExpired).toBeDefined();
      expect(keycloakMock.onAuthRefreshError).toBeDefined();
    });
  });

  describe('Keycloak event callbacks', () => {
    beforeEach(async () => {
      await service.init();
    });

    it('should clear tokens on onAuthLogout', () => {
      sessionStorage.setItem(TOKEN_KEY, 'token');
      sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh');

      keycloakMock.onAuthLogout?.();

      expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    });

    it('should trigger updateToken on onTokenExpired', () => {
      spyOn(service, 'updateToken');

      keycloakMock.onTokenExpired?.();

      expect(service.updateToken).toHaveBeenCalled();
    });

    it('should clear tokens and logout on onAuthRefreshError', () => {
      spyOn(service, 'clearTokens');
      spyOn(service, 'logout');

      keycloakMock.onAuthRefreshError?.();

      expect(service.clearTokens).toHaveBeenCalled();
      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call keycloak.login when there is no access token', async () => {
      keycloakMock.token = undefined;

      await service.login();

      expect(keycloakMock.login).toHaveBeenCalledWith(
        jasmine.objectContaining({
          redirectUri: service['REDIRECT_URI'],
        })
      );
    });

    it('should not call keycloak.login when token already exists', async () => {
      keycloakMock.token = 'existing-token';

      await service.login();

      expect(keycloakMock.login).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should return early when already logging out', () => {
      service['isLoggingOut'] = true;

      service.logout();

      expect(keycloakMock.logout).not.toHaveBeenCalled();
    });

    it('should clear tokens and return without calling keycloak.logout when unauthenticated', () => {
      keycloakMock.authenticated = false;
      spyOn(service, 'clearTokens');

      service.logout();

      expect(service.clearTokens).toHaveBeenCalled();
      expect(keycloakMock.logout).not.toHaveBeenCalled();
      expect(service['isLoggingOut']).toBeFalse();
    });

    it('should set isLoggingOut, clear tokens, and call keycloak.logout when authenticated', () => {
      keycloakMock.authenticated = true;
      spyOn(service, 'clearTokens');

      service.logout();

      expect(service['isLoggingOut']).toBeTrue();
      expect(service.clearTokens).toHaveBeenCalled();
      expect(keycloakMock.logout).toHaveBeenCalled();
    });
  });

  describe('updateToken', () => {
    it('should store tokens and return true when token was refreshed successfully', async () => {
      keycloakMock.updateToken.and.resolveTo(true);
      spyOn(service, 'storeTokens');

      const result = await service.updateToken();

      expect(keycloakMock.updateToken).toHaveBeenCalledWith(15);
      expect(service.storeTokens).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should clear tokens and return false when keycloak.updateToken returns false', async () => {
      keycloakMock.updateToken.and.resolveTo(false);
      spyOn(service, 'clearTokens');

      const result = await service.updateToken();

      expect(service.clearTokens).toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it('should catch error, log, clear tokens and return false when updateToken throws', async () => {
      spyOn(console, 'error');
      spyOn(service, 'clearTokens');
      const refreshError = new Error('Refresh error');
      keycloakMock.updateToken.and.rejectWith(refreshError);

      const result = await service.updateToken();

      expect(console.error).toHaveBeenCalledWith(
        'An error has ocured while refreshing the access token',
        refreshError
      );
      expect(service.clearTokens).toHaveBeenCalled();
      expect(result).toBeFalse();
    });
  });

  describe('getAccessToken and getRefreshToken', () => {
    it('should return access token from keycloak', () => {
      keycloakMock.token = 'access-xyz';
      expect(service.getAccessToken()).toBe('access-xyz');
    });

    it('should return refresh token from keycloak', () => {
      keycloakMock.refreshToken = 'refresh-xyz';
      expect(service.getRefreshToken()).toBe('refresh-xyz');
    });
  });

  describe('handleRefresh', () => {
    it('should clone request with new Authorization header and retry next handler when refresh succeeds', async () => {
      spyOn(service, 'updateToken').and.resolveTo(true);
      keycloakMock.token = 'refreshed-access-token';

      const originalRequest = new HttpRequest<unknown>('GET', '/api/data');
      const expectedResponse: HttpEvent<unknown> = new HttpResponse<unknown>({
        status: 200,
      });

      let interceptedRequest: HttpRequest<unknown> | undefined;
      const nextHandler: HttpHandlerFn = (req: HttpRequest<unknown>) => {
        interceptedRequest = req;
        return of(expectedResponse);
      };

      const response = await firstValueFrom(
        service.handleRefresh(originalRequest, nextHandler)
      );

      expect(response).toBe(expectedResponse);
      expect(interceptedRequest).toBeDefined();
      expect(interceptedRequest?.headers.get('Authorization')).toBe(
        'Bearer refreshed-access-token'
      );
    });

    it('should call logout and execute next handler with original request when refresh fails', async () => {
      spyOn(service, 'updateToken').and.resolveTo(false);
      spyOn(service, 'logout');

      const originalRequest = new HttpRequest<unknown>('GET', '/api/data');
      const expectedResponse: HttpEvent<unknown> = new HttpResponse<unknown>({
        status: 401,
      });

      let interceptedRequest: HttpRequest<unknown> | undefined;
      const nextHandler: HttpHandlerFn = (req: HttpRequest<unknown>) => {
        interceptedRequest = req;
        return of(expectedResponse);
      };

      const response = await firstValueFrom(
        service.handleRefresh(originalRequest, nextHandler)
      );

      expect(service.logout).toHaveBeenCalled();
      expect(response).toBe(expectedResponse);
      expect(interceptedRequest).toBe(originalRequest);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when keycloak is authenticated', () => {
      keycloakMock.authenticated = true;
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when keycloak is not authenticated', () => {
      keycloakMock.authenticated = false;
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false when authenticated property is undefined', () => {
      keycloakMock.authenticated = undefined;
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('storeTokens', () => {
    it('should save tokens to sessionStorage when both exist', () => {
      keycloakMock.token = 'tok-1';
      keycloakMock.refreshToken = 'tok-2';

      service.storeTokens();

      expect(sessionStorage.getItem(TOKEN_KEY)).toBe('tok-1');
      expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('tok-2');
    });

    it('should log errors when token or refreshToken are missing', () => {
      spyOn(console, 'error');
      keycloakMock.token = undefined;
      keycloakMock.refreshToken = undefined;

      service.storeTokens();

      expect(console.error).toHaveBeenCalledWith('No keycloak token to store');
      expect(console.error).toHaveBeenCalledWith(
        'No keycloak refresh token to store'
      );
      expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should remove both token keys from sessionStorage', () => {
      sessionStorage.setItem(TOKEN_KEY, 'some-token');
      sessionStorage.setItem(REFRESH_TOKEN_KEY, 'some-refresh-token');

      service.clearTokens();

      expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    });
  });
});
