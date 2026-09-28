import { UserDataService } from '@core/services/access/user-data.service';
import { RoleBasedFetchResolver } from './role-based-fetch.resolver';
import { signal } from '@angular/core';
import { ERASRoles, Profile } from '@core/models/profile.model';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { RoleFetchStrategyMap } from './role-based-fetch.types';

interface FakeResource {
  id: number;
  name: string;
  createdBy: string;
  officer?: string;
}

class FakeService {
  getAll(): Observable<FakeResource[]> {
    return of([
      { id: 1, name: 'elementA', createdBy: 'uuid-1' },
      { id: 2, name: 'elementB', createdBy: 'uuid-2' },
    ]);
  }

  getByCreator(uuid: string): Observable<FakeResource[]> {
    return of([{ id: 1, name: 'element', createdBy: `${uuid}` }]);
  }

  getByOfficer(uuid: string): Observable<FakeResource[]> {
    return of([
      { id: 1, name: 'element', createdBy: `${uuid}`, officer: 'Officer' },
    ]);
  }

  getForGuests(): Observable<FakeResource[]> {
    return of([]);
  }
}

describe('RoleBasedFetchResolver', () => {
  let resolver: RoleBasedFetchResolver;
  let userSignal: ReturnType<typeof signal<Profile | null>>;
  let fakeService: FakeService;

  const strategies: RoleFetchStrategyMap<FakeService, FakeResource[]> = {
    [ERASRoles.ADMIN]: service => service.getAll(),
    [ERASRoles.OFFICER]: (service, context) =>
      context?.currentUserId
        ? service.getByOfficer(context.currentUserId)
        : throwError(() => 'User ID not provided.'),
    [ERASRoles.PROFESSIONAL]: (service, context) =>
      context?.currentUserId
        ? service.getByCreator(context.currentUserId)
        : throwError(() => 'User ID not provided.'),
    [ERASRoles.GUEST]: service => service.getForGuests(),
  };

  beforeEach(() => {
    userSignal = signal<Profile | null>(null);
    const userDataServiceMock = {
      user: userSignal,
    };
    fakeService = new FakeService();

    TestBed.configureTestingModule({
      providers: [{ provide: UserDataService, useValue: userDataServiceMock }],
    });

    resolver = TestBed.inject(RoleBasedFetchResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call the strategy for ERAS Administrator', done => {
    userSignal.set({ role: ERASRoles.ADMIN });

    resolver.resolve(fakeService, strategies).subscribe(result => {
      expect(result).toEqual([
        { id: 1, name: 'elementA', createdBy: 'uuid-1' },
        { id: 2, name: 'elementB', createdBy: 'uuid-2' },
      ]);
      done();
    });
  });

  it('should call the strategy for ERAS Students Service Officer', done => {
    userSignal.set({ id: 'uuid-1', role: ERASRoles.OFFICER });

    resolver.resolve(fakeService, strategies).subscribe(result => {
      expect(result).toEqual([
        { id: 1, name: 'element', createdBy: 'uuid-1', officer: 'Officer' },
      ]);
      done();
    });
  });

  it('should call the strategy for ERAS Professional', done => {
    userSignal.set({ id: 'uuid-2', role: ERASRoles.PROFESSIONAL });

    resolver.resolve(fakeService, strategies).subscribe(result => {
      expect(result).toEqual([{ id: 1, name: 'element', createdBy: 'uuid-2' }]);
      done();
    });
  });

  it('should call the strategy for ERAS Guest', done => {
    userSignal.set({ role: ERASRoles.GUEST });

    resolver.resolve(fakeService, strategies).subscribe(result => {
      expect(result).toEqual([]);
      done();
    });
  });

  it('should throw error if user is not authenticated', done => {
    resolver.resolve(fakeService, strategies).subscribe({
      error: error => {
        expect(error.message).toBe('User is not authenticated.');
        done();
      },
    });
  });

  it('should throw error if role is not assigned', done => {
    userSignal.set({ id: 'uuid-2' });
    resolver.resolve(fakeService, strategies).subscribe({
      error: error => {
        expect(error.message).toBe('User does not have a role assigned.');
        done();
      },
    });
  });

  it('should propagate error if service call fails', done => {
    userSignal.set({ role: ERASRoles.ADMIN });
    spyOn(fakeService, 'getAll').and.returnValue(
      throwError(() => new Error('Network error.'))
    );

    resolver.resolve(fakeService, strategies).subscribe({
      error: err => {
        expect(err.message).toBe('Network error.');
        done();
      },
    });
  });
});
