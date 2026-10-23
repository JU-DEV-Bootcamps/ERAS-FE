import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/access/access.service';
import { keycloakHttpInterceptor } from './keycloak-interceptor';

describe('keycloakHttpInterceptor', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let nextSpy: jasmine.Spy<HttpHandlerFn>;
  const dummyRequest = new HttpRequest('GET', '/api/test');

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getAccessToken',
      'isAuthenticated',
      'handleRefresh',
    ]);
    nextSpy = jasmine.createSpy('next');

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });
  });

  it('should add Authorization header when token exists', done => {
    authServiceSpy.getAccessToken.and.returnValue('mock-token');
    const mockResponse = new HttpResponse({ status: 200 });
    nextSpy.and.returnValue(of(mockResponse));

    TestBed.runInInjectionContext(() =>
      keycloakHttpInterceptor(dummyRequest, nextSpy)
    ).subscribe(response => {
      expect(nextSpy).toHaveBeenCalled();
      const interceptedRequest: HttpRequest<unknown> =
        nextSpy.calls.mostRecent().args[0];
      expect(interceptedRequest.headers.get('Authorization')).toBe(
        'Bearer mock-token'
      );
      expect(response).toBe(mockResponse);
      done();
    });
  });

  it('should forward original request without Authorization header when token is missing', done => {
    authServiceSpy.getAccessToken.and.returnValue(undefined);
    const mockResponse = new HttpResponse({ status: 200 });
    nextSpy.and.returnValue(of(mockResponse));

    TestBed.runInInjectionContext(() =>
      keycloakHttpInterceptor(dummyRequest, nextSpy)
    ).subscribe(response => {
      expect(nextSpy).toHaveBeenCalledWith(dummyRequest);
      expect(response).toBe(mockResponse);
      done();
    });
  });

  it('should call handleRefresh when 401 error occurs and user is authenticated', done => {
    authServiceSpy.getAccessToken.and.returnValue(undefined);
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const refreshResponse = of(new HttpResponse({ status: 200 }));
    authServiceSpy.handleRefresh.and.returnValue(refreshResponse);

    const error401 = new HttpErrorResponse({ status: 401 });
    nextSpy.and.returnValue(throwError(() => error401));

    TestBed.runInInjectionContext(() =>
      keycloakHttpInterceptor(dummyRequest, nextSpy)
    ).subscribe(() => {
      expect(authServiceSpy.handleRefresh).toHaveBeenCalledWith(
        dummyRequest,
        nextSpy
      );
      done();
    });
  });

  it('should rethrow error when 401 occurs but user is not authenticated', done => {
    authServiceSpy.getAccessToken.and.returnValue(undefined);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const error401 = new HttpErrorResponse({ status: 401 });
    nextSpy.and.returnValue(throwError(() => error401));

    TestBed.runInInjectionContext(() =>
      keycloakHttpInterceptor(dummyRequest, nextSpy)
    ).subscribe({
      next: () => fail('should have thrown error'),
      error: err => {
        expect(err).toBe(error401);
        expect(authServiceSpy.handleRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should rethrow non-401 errors without calling handleRefresh', done => {
    authServiceSpy.getAccessToken.and.returnValue(undefined);

    const error500 = new HttpErrorResponse({ status: 500 });
    nextSpy.and.returnValue(throwError(() => error500));

    TestBed.runInInjectionContext(() =>
      keycloakHttpInterceptor(dummyRequest, nextSpy)
    ).subscribe({
      next: () => fail('should have thrown error'),
      error: err => {
        expect(err).toBe(error500);
        expect(authServiceSpy.handleRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
