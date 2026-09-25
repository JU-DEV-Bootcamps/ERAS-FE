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

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let httpMock: HttpTestingController;
  let userDataMock: { user: jasmine.Spy };
  let queryParams: Record<string, string>;

  const baseUrl = environment.apiUrl + '/api/v1/feature-flags';
  const mockFlags = [{ id: 1, name: 'v2', isEnabled: true }];

  beforeEach(() => {
    queryParams = {};
    userDataMock = {
      user: jasmine.createSpy('user').and.returnValue({ role: 'Eras Admin' }),
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

  afterEach(() => httpMock.verify());

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

  it('loadFlags should default to disabled when v2 flag is missing', () => {
    service.loadFlags().subscribe();
    const req = httpMock.expectOne(baseUrl);
    req.flush([{ id: 2, name: 'other', isEnabled: true }]);

    const anyFlag = Object.values(FEATURE_FLAGS)[0];
    expect(service.flags()[anyFlag]).toBeFalse();
  });

  it('loadFlags should swallow errors and complete', () => {
    let completed = false;
    service.loadFlags().subscribe({ complete: () => (completed = true) });
    const req = httpMock.expectOne(baseUrl);
    req.error(new ProgressEvent('error'));

    expect(completed).toBeTrue();
  });

  it('isEnabled should return true when ?v2=true regardless of role', () => {
    queryParams = { v2: 'true' };
    userDataMock.user.and.returnValue({ role: 'User' });
    expect(service.isEnabled('anyFlag')).toBeTrue();
  });

  it('isEnabled should return true when the specific flag query param is true', () => {
    queryParams = { myFlag: 'true' };
    userDataMock.user.and.returnValue({ role: 'User' });
    expect(service.isEnabled('myFlag')).toBeTrue();
  });

  it('isEnabled should return false for non-admin users with no override', () => {
    userDataMock.user.and.returnValue({ role: 'User' });
    expect(service.isEnabled('someFlag')).toBeFalse();
  });

  it('isEnabled should return backend value for admin users with no override', () => {
    userDataMock.user.and.returnValue({ role: 'Eras Admin' });
    service.loadFlags().subscribe();
    httpMock.expectOne(baseUrl).flush(mockFlags);

    const anyFlag = Object.values(FEATURE_FLAGS)[0];
    expect(service.isEnabled(anyFlag)).toBeTrue();
  });

  it('toggle should PUT the updated flag and update local state on success', () => {
    service.loadFlags().subscribe();
    httpMock.expectOne(baseUrl).flush(mockFlags);

    service.toggle('v2', false).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.isEnabled).toBeFalse();
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
