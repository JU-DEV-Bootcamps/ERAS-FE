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
import { ERASRoles } from '@core/models/profile.model';
import { environment } from 'src/environments/environment';

describe('canActivateAuthRole', () => {
  const originalEnvironment = { ...environment };
  let mockKeycloak: {
    authenticated: boolean;
    resourceAccess: Record<string, { roles: string[] }>;
  };
  let routerSpy: jasmine.SpyObj<Router>;
  let dummyState: RouterStateSnapshot;
  const mockUrlTree = {} as UrlTree;

  beforeEach(() => {
    environment.keycloak.clientId = 'public-client';
    mockKeycloak = {
      authenticated: false,
      resourceAccess: {},
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

  afterEach(() => {
    Object.assign(environment, originalEnvironment);
  });

  const executeGuard = async (route: ActivatedRouteSnapshot) => {
    const result = TestBed.runInInjectionContext(() =>
      canActivateAuthRole(route, dummyState)
    );
    return isObservable(result) ? await firstValueFrom(result) : await result;
  };

  it('should return true if route does not specify a role', async () => {
    const route = { data: {} } as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;

    const result = await executeGuard(route);

    expect(result).toBeTrue();
    expect(routerSpy.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /home if user is not authenticated', async () => {
    const route = {
      data: { roles: [ERASRoles.ADMIN] },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = false;

    const result = await executeGuard(route);

    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/home');
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to /home if user is authenticated but lacks the required role', async () => {
    const route = {
      data: { roles: [ERASRoles.ADMIN] },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;
    mockKeycloak.resourceAccess = {
      'public-client': { roles: ['ERAS Professional'] },
    };

    const result = await executeGuard(route);

    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/home');
    expect(result).toBe(mockUrlTree);
  });

  it('should return true if user is authenticated and possesses the required role', async () => {
    const route = {
      data: { roles: [ERASRoles.PROFESSIONAL] },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;
    mockKeycloak.resourceAccess = {
      'public-client': { roles: ['ERAS Professional'] },
    };

    const result = await executeGuard(route);

    expect(result).toBeTrue();
    expect(routerSpy.parseUrl).not.toHaveBeenCalled();
  });

  it('should return true if user has ERAS Administrator role', async () => {
    const route = {
      data: { roles: [ERASRoles.PROFESSIONAL] },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;
    mockKeycloak.resourceAccess = {
      'public-client': { roles: ['ERAS Administrator'] },
    };

    const result = await executeGuard(route);

    expect(result).toBeTrue();
    expect(routerSpy.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /home if no resourceRoles are found', async () => {
    const route = {
      data: { roles: [ERASRoles.ADMIN] },
    } as unknown as ActivatedRouteSnapshot;
    mockKeycloak.authenticated = true;
    mockKeycloak.resourceAccess = {
      'another-client': { roles: ['manager'] },
    };

    const result = await executeGuard(route);

    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/home');
    expect(result).toBe(mockUrlTree);
  });
});
