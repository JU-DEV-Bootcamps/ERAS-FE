import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FeatureFlagsService } from './feature-flags.service';
import { environment } from 'src/environments/environment';
import { UserDataService } from '@core/services/access/user-data.service';
import { FEATURE_FLAGS } from './feature-flags';
import { ERASRoles } from '@core/models/profile.model';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let httpMock: HttpTestingController;
  let userDataMock: { user: jasmine.Spy };
  let queryParams: Record<string, string>;

  const baseUrl = environment.apiUrl + '/api/v1/feature-flags';
  const mockFlags = [{ id: 1, name: 'v2', isEnabled: true }];

  beforeEach(() => {
    sessionStorage.removeItem('erasFeatureFlagOverrides');
    queryParams = {};
    userDataMock = {
      user: jasmine
        .createSpy('user')
        .and.returnValue({ role: ERASRoles.ADMIN }),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FeatureFlagsService,
        { provide: UserDataService, useValue: userDataMock },
        {
          provide: Router,
          useValue: {
            routerState: {
              root: {
                snapshot: {
                  get queryParams() {
                    return queryParams;
                  },
                },
              },
            },
          },
        },
      ],
    });

    service = TestBed.inject(FeatureFlagsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.removeItem('erasFeatureFlagOverrides');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loadFlags should map all FEATURE_FLAGS to the v2 flag value on success', () => {
    service.loadFlags().subscribe();
    const req = httpMock.expectOne(baseUrl);
    req.flush(mockFlags);

    const anyFlag = Object.values(FEATURE_FLAGS)[0];
    expect(service.flags()[anyFlag]).toBeTrue();
  });

  it('loadFlags should turn every flag off when the v2 flag is disabled', () => {
    service.loadFlags().subscribe();
    httpMock
      .expectOne(baseUrl)
      .flush([{ id: 1, name: 'v2', isEnabled: false }]);

    Object.values(FEATURE_FLAGS).forEach(flag =>
      expect(service.flags()[flag]).withContext(flag).toBeFalse()
    );
  });

  it('loadFlags should default to enabled when the v2 flag is missing', () => {
    service.loadFlags().subscribe();
    const req = httpMock.expectOne(baseUrl);
    req.flush([{ id: 2, name: 'other', isEnabled: true }]);

    Object.values(FEATURE_FLAGS).forEach(flag =>
      expect(service.flags()[flag]).withContext(flag).toBeTrue()
    );
  });

  it('should be on v2 before the flags are loaded', () => {
    Object.values(FEATURE_FLAGS).forEach(flag =>
      expect(service.isEnabled(flag)).withContext(flag).toBeTrue()
    );
  });

  it('loadFlags should swallow errors, complete and stay on v2', () => {
    let completed = false;
    service.loadFlags().subscribe({ complete: () => (completed = true) });
    const req = httpMock.expectOne(baseUrl);
    req.error(new ProgressEvent('error'));

    expect(completed).toBeTrue();
    expect(service.isEnabled(Object.values(FEATURE_FLAGS)[0])).toBeTrue();
  });

  it('isEnabled should return true when ?v2=true regardless of role', () => {
    queryParams = { v2: 'true' };
    userDataMock.user.and.returnValue({ role: ERASRoles.PROFESSIONAL });
    expect(service.isEnabled('anyFlag')).toBeTrue();
  });

  it('isEnabled should return true when the specific flag query param is true', () => {
    queryParams = { myFlag: 'true' };
    userDataMock.user.and.returnValue({ role: ERASRoles.OFFICER });
    expect(service.isEnabled('myFlag')).toBeTrue();
  });

  it('isEnabled should keep a ?v2=true override after the param disappears (reload/navigation)', () => {
    userDataMock.user.and.returnValue({ role: ERASRoles.PROFESSIONAL });
    queryParams = { v2: 'true' };
    expect(service.isEnabled('anyFlag')).toBeTrue();

    queryParams = {};
    expect(service.isEnabled('anyFlag')).toBeTrue();
  });

  it('isEnabled should keep a flag-specific override after the param disappears', () => {
    userDataMock.user.and.returnValue({ role: ERASRoles.OFFICER });
    queryParams = { myFlag: 'true' };
    expect(service.isEnabled('myFlag')).toBeTrue();

    queryParams = {};
    expect(service.isEnabled('myFlag')).toBeTrue();
    expect(service.isEnabled('otherFlag')).toBeFalse();
  });

  it('isEnabled should drop a stored override when the param is explicitly false', () => {
    userDataMock.user.and.returnValue({ role: ERASRoles.PROFESSIONAL });
    queryParams = { v2: 'true' };
    expect(service.isEnabled('anyFlag')).toBeTrue();

    queryParams = { v2: 'false' };
    expect(service.isEnabled('anyFlag')).toBeFalse();

    queryParams = {};
    expect(service.isEnabled('anyFlag')).toBeFalse();
  });

  describe('version overrides in the URL', () => {
    const knownFlag = Object.values(FEATURE_FLAGS)[0];

    beforeEach(() => {
      service.loadFlags().subscribe();
      httpMock
        .expectOne(baseUrl)
        .flush([{ id: 1, name: 'v2', isEnabled: true }]);
    });

    it('?v1=true should show v1 even though v2 is the default', () => {
      expect(service.isEnabled(knownFlag)).toBeTrue();

      queryParams = { v1: 'true' };

      Object.values(FEATURE_FLAGS).forEach(flag =>
        expect(service.isEnabled(flag)).withContext(flag).toBeFalse()
      );
    });

    it('?v2=false should also show v1', () => {
      queryParams = { v2: 'false' };

      expect(service.isEnabled(knownFlag)).toBeFalse();
    });

    it('should keep showing v1 after the param disappears (reload/navigation)', () => {
      queryParams = { v1: 'true' };
      expect(service.isEnabled(knownFlag)).toBeFalse();

      queryParams = {};
      expect(service.isEnabled(knownFlag)).toBeFalse();
    });

    it('?v2=true should go back to v2 after ?v1=true', () => {
      queryParams = { v1: 'true' };
      expect(service.isEnabled(knownFlag)).toBeFalse();

      queryParams = { v2: 'true' };
      expect(service.isEnabled(knownFlag)).toBeTrue();

      queryParams = {};
      expect(service.isEnabled(knownFlag)).toBeTrue();
    });

    it('?v1=false should stop forcing v1 and use the backend value again', () => {
      queryParams = { v1: 'true' };
      expect(service.isEnabled(knownFlag)).toBeFalse();

      queryParams = { v1: 'false' };
      expect(service.isEnabled(knownFlag)).toBeTrue();

      queryParams = {};
      expect(service.isEnabled(knownFlag)).toBeTrue();
    });

    it('?v2=true should show v2 even when the backend flag is off', () => {
      service.loadFlags().subscribe();
      httpMock
        .expectOne(baseUrl)
        .flush([{ id: 1, name: 'v2', isEnabled: false }]);
      expect(service.isEnabled(knownFlag)).toBeFalse();

      queryParams = { v2: 'true' };

      expect(service.isEnabled(knownFlag)).toBeTrue();
    });

    it('the URL overrides should work for every role, not only for admins', () => {
      [
        ERASRoles.ADMIN,
        ERASRoles.OFFICER,
        ERASRoles.PROFESSIONAL,
        ERASRoles.GUEST,
      ].forEach(role => {
        sessionStorage.removeItem('erasFeatureFlagOverrides');
        userDataMock.user.and.returnValue({ role });

        queryParams = { v1: 'true' };
        expect(service.isEnabled(knownFlag))
          .withContext(`v1 as ${role}`)
          .toBeFalse();

        queryParams = { v2: 'true' };
        expect(service.isEnabled(knownFlag))
          .withContext(`v2 as ${role}`)
          .toBeTrue();
      });
    });

    it('the V1 switch (toggle) should clear a ?v1=true override', () => {
      queryParams = { v1: 'true' };
      expect(service.isEnabled(knownFlag)).toBeFalse();
      queryParams = {};

      service.toggle('v2', true).subscribe();
      httpMock.expectOne(`${baseUrl}/1`).flush(null);

      expect(service.isEnabled(knownFlag)).toBeTrue();
    });
  });

  it('isEnabled should ignore corrupted stored overrides', () => {
    sessionStorage.setItem('erasFeatureFlagOverrides', 'not-json');
    userDataMock.user.and.returnValue({ role: ERASRoles.PROFESSIONAL });
    expect(service.isEnabled('anyFlag')).toBeFalse();
  });

  it('isEnabled should return false for a flag that is not a known feature flag', () => {
    userDataMock.user.and.returnValue({ role: ERASRoles.GUEST });
    expect(service.isEnabled('someFlag')).toBeFalse();
  });

  it('isEnabled should return the backend value for every role with no override', () => {
    const anyFlag = Object.values(FEATURE_FLAGS)[0];

    [
      ERASRoles.ADMIN,
      ERASRoles.OFFICER,
      ERASRoles.PROFESSIONAL,
      ERASRoles.GUEST,
    ].forEach(role => {
      userDataMock.user.and.returnValue({ role });
      service.loadFlags().subscribe();
      httpMock
        .expectOne(baseUrl)
        .flush([{ id: 1, name: 'v2', isEnabled: true }]);
      expect(service.isEnabled(anyFlag)).withContext(role).toBeTrue();

      service.loadFlags().subscribe();
      httpMock
        .expectOne(baseUrl)
        .flush([{ id: 1, name: 'v2', isEnabled: false }]);
      expect(service.isEnabled(anyFlag)).withContext(role).toBeFalse();
    });
  });

  it('toggle should PUT the updated flag and update local state on success', () => {
    service.loadFlags().subscribe();
    httpMock.expectOne(baseUrl).flush(mockFlags);

    service.toggle('v2', false).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.isEnabled).toBeFalse();
    req.flush(null);

    expect(service.isEnabled(Object.values(FEATURE_FLAGS)[0])).toBeFalse();
  });

  it('toggle should clear stored query param overrides once it succeeds', () => {
    service.loadFlags().subscribe();
    httpMock.expectOne(baseUrl).flush(mockFlags);
    userDataMock.user.and.returnValue({ role: ERASRoles.ADMIN });
    queryParams = { v2: 'true' };
    expect(service.isEnabled('anyFlag')).toBeTrue();
    queryParams = {};

    service.toggle('v2', false).subscribe();
    httpMock.expectOne(`${baseUrl}/1`).flush(null);

    expect(service.isEnabled('anyFlag')).toBeFalse();
  });

  it('toggle should warn and no-op if flag is not found in meta', () => {
    spyOn(console, 'warn');
    service.toggle('unknown', true).subscribe();
    httpMock.expectNone(`${baseUrl}/undefined`);
    expect(console.warn).toHaveBeenCalled();
  });

  it('toggle should swallow http errors', () => {
    service.loadFlags().subscribe();
    httpMock.expectOne(baseUrl).flush(mockFlags);

    let completed = false;
    service
      .toggle('v2', true)
      .subscribe({ complete: () => (completed = true) });
    httpMock.expectOne(`${baseUrl}/1`).error(new ProgressEvent('error'));
    expect(completed).toBeTrue();
  });

  it('enableLocal and disableLocal should update the flags signal directly', () => {
    service.enableLocal('x');
    expect(service.flags()['x']).toBeTrue();

    service.disableLocal('x');
    expect(service.flags()['x']).toBeFalse();
  });
});
