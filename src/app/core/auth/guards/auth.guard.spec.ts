import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@core/services/access/access.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'login',
    ]);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });
  });

  it('should return true and not trigger login if user is already authenticated', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState)
    );

    expect(result).toBeTrue();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login and return true when user becomes authenticated after login', async () => {
    authServiceSpy.isAuthenticated.and.returnValues(false, true);
    authServiceSpy.login.and.returnValue(Promise.resolve());

    const result = await TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState)
    );

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('should call login and return false if user remains unauthenticated after login', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.login.and.returnValue(Promise.resolve());

    const result = await TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState)
    );

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(result).toBeFalse();
  });
});
