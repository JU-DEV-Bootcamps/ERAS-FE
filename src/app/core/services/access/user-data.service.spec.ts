import { TestBed } from '@angular/core/testing';
import keycloak, { KeycloakProfile } from 'keycloak-js';
import { of, throwError } from 'rxjs';
import { UserDataService } from './user-data.service';
import { UsersService } from '@core/services/api/users.service';
import { ERASRoles, Profile } from '@core/models/profile.model';

interface KeycloakMock {
  loadUserProfile: () => Promise<unknown>;
  resourceAccess?: Record<string, { roles: string[] }>;
}

describe('UserDataService', () => {
  let service: UserDataService;
  let mockKeycloak: jasmine.SpyObj<KeycloakMock>;
  let mockUsersService: jasmine.SpyObj<UsersService>;

  beforeEach(() => {
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['loadUserProfile']);
    mockUsersService = jasmine.createSpyObj('UsersService', ['sync']);
    mockUsersService.sync.and.returnValue(of({}));
    TestBed.configureTestingModule({
      providers: [
        { provide: keycloak, useValue: mockKeycloak },
        { provide: UsersService, useValue: mockUsersService },
        UserDataService,
      ],
    });
    sessionStorage.clear();
  });

  it('Should initially has null values if no data exist on Session Storage.', () => {
    service = TestBed.inject(UserDataService);
    expect(service.user()).toBeNull();
  });

  it('Should load the user form SessionStorage if exist data valid.', () => {
    const profile: Profile = { id: '1', name: 'Test User' } as Profile;
    sessionStorage.setItem('erasUserProfile', JSON.stringify(profile));
    service = TestBed.inject(UserDataService);

    expect(service.user()).toEqual(profile);
    expect(JSON.parse(sessionStorage.getItem('erasUserProfile')!)).toEqual(
      profile
    );
  });

  it('Should be set as null if wrong data is passed.', () => {
    sessionStorage.setItem('erasUserProfile', 'wrong data');
    service = TestBed.inject(UserDataService);

    expect(service.user()).toBeNull();
    expect(sessionStorage.getItem('erasUserProfile')).toBeNull();
  });

  it('Should fill user, if current user is null, at initUser method.', async () => {
    const profile: Profile = {
      firstName: 'user1',
      id: '2',
      lastName: 'last1',
      role: ERASRoles.GUEST,
      fullName: 'user1 last1',
    } as Profile;
    mockKeycloak.loadUserProfile.and.returnValue(Promise.resolve(profile));
    service = TestBed.inject(UserDataService);
    await service.initUser();

    expect(mockKeycloak.loadUserProfile).toHaveBeenCalled();
    expect(service.user()).toEqual(profile);
    expect(JSON.parse(sessionStorage.getItem('erasUserProfile')!)).toEqual(
      profile
    );
    expect(mockUsersService.sync).toHaveBeenCalled();
  });

  it('Should not fill again the user if it was already loaded, at initUser method', async () => {
    const profile: Profile = { firstName: 'user1', id: '3' } as Profile;
    sessionStorage.setItem('erasUserProfile', JSON.stringify(profile));
    service = TestBed.inject(UserDataService);
    await service.initUser();
    expect(mockKeycloak.loadUserProfile).not.toHaveBeenCalled();
    expect(service.user()).toEqual(profile);
    expect(mockUsersService.sync).not.toHaveBeenCalled();
  });

  it('Should not throw if syncing the ERAS user profile with the backend fails', async () => {
    const keycloakProfile = { firstName: 'user1', id: '5' } as KeycloakProfile;
    mockKeycloak.loadUserProfile.and.returnValue(
      Promise.resolve(keycloakProfile)
    );
    mockUsersService.sync.and.returnValue(
      throwError(() => new Error('network error'))
    );
    service = TestBed.inject(UserDataService);

    await expectAsync(service.initUser()).toBeResolved();
    expect(service.user()?.id).toBe('5');
  });

  it('Should clean up user and session storage, when clear method is trigger.', async () => {
    const profile: Profile = { firstName: 'user1', id: '4' } as Profile;
    mockKeycloak.loadUserProfile.and.returnValue(Promise.resolve(profile));
    service = TestBed.inject(UserDataService);
    await service.initUser();
    service.clear();
    expect(service.user()).toBeNull();
    expect(sessionStorage.getItem('erasUserProfile')).toBeNull();
  });

  describe('mapToProfileModel', () => {
    it('should use only firstName for fullName when lastName is missing', async () => {
      mockKeycloak.loadUserProfile.and.returnValue(
        Promise.resolve({ id: '20', firstName: 'Grace' } as KeycloakProfile)
      );
      service = TestBed.inject(UserDataService);
      await service.initUser();

      expect(service.user()?.fullName).toBe('Grace');
    });
  });
});
