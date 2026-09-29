import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { isObservable, firstValueFrom } from 'rxjs';
import Keycloak from 'keycloak-js';
import { canActivateAuthRole } from './auth-role.guard';

describe('canActivateAuthRole', () => {
  let mockKeycloak: {
    authenticated: boolean;
    resourceAccess: Record<string, { roles: string[] }>;
    realmAccess: { roles: string[] };
  };
  let routerSpy: jasmine.SpyObj<Router>;
  let dummyState: RouterStateSnapshot;
  const mockUrlTree = {} as UrlTree;

  beforeEach(() => {
    mockKeycloak = {
      authenticated: false,
      resourceAccess: {},
      realmAccess: { roles: [] },
    };

    routerSpy = jasmine.createSpyObj<Router>('Router', ['parseUrl']);
    routerSpy.parseUrl.and.returnValue(mockUrlTree);
    dummyState = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  const executeGuard = async (route: ActivatedRouteSnapshot) => {
    const result = TestBed.runInInjectionContext(() =>
      canActivateAuthRole(route, dummyState)
    );
    return isObservable(result) ? await firstValueFrom(result) : await result;
  };

  it('should return false if route does not specify a role', async () => {
    const route = { data: {} } as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;

    const result = await executeGuard(route);

    expect(result).toBeFalse();
    expect(routerSpy.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /forbidden if user is not authenticated', async () => {
    const route = {
      data: { role: 'admin' },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = false;

    const result = await executeGuard(route);

    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/forbidden');
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to /forbidden if user is authenticated but lacks the required role', async () => {
    const route = {
      data: { role: 'admin' },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;
    mockKeycloak.resourceAccess = {
      clientApp: { roles: ['user', 'guest'] },
    };

    const result = await executeGuard(route);

    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/forbidden');
    expect(result).toBe(mockUrlTree);
  });

  it('should return true if user is authenticated and possesses the required role', async () => {
    const route = {
      data: { role: 'admin' },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;
    mockKeycloak.resourceAccess = {
      clientApp: { roles: ['admin', 'user'] },
    };

    const result = await executeGuard(route);

    expect(result).toBeTrue();
    expect(routerSpy.parseUrl).not.toHaveBeenCalled();
  });
});
