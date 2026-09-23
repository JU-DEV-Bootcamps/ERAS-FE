import { TestBed } from '@angular/core/testing';
import keycloak, { KeycloakProfile } from 'keycloak-js';
import { UserDataService } from './user-data.service';
import { ERASRoles, Profile } from '@core/models/profile.model';

interface KeycloakMock {
  loadUserProfile: () => Promise<unknown>;
  resourceAccess?: Record<string, { roles: string[] }>;
}

/**
 * Helper que crea un mock de resourceAccess usando un Proxy.
 * Responde con los roles indicados para CUALQUIER clientId que consulte el servicio.
 */
function createResourceAccessMock(
  roles: string[]
): Record<string, { roles: string[] }> {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === 'symbol' || prop === 'then' || prop === 'toJSON') {
          return undefined;
        }
        return { roles };
      },
    }
  );
}

describe('UserDataService', () => {
  let service: UserDataService;
  let mockKeycloak: jasmine.SpyObj<KeycloakMock>;

  beforeEach(() => {
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['loadUserProfile']);
    TestBed.configureTestingModule({
      providers: [
        { provide: keycloak, useValue: mockKeycloak },
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
  });

  it('Should not fill again the user if it was already loaded, at initUser method', async () => {
    const profile: Profile = { firstName: 'user1', id: '3' } as Profile;
    sessionStorage.setItem('erasUserProfile', JSON.stringify(profile));
    service = TestBed.inject(UserDataService);
    await service.initUser();
    expect(mockKeycloak.loadUserProfile).not.toHaveBeenCalled();
    expect(service.user()).toEqual(profile);
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

  describe('role mapping (getUserRole via initUser)', () => {
    const keycloakProfile = (): KeycloakProfile =>
      ({ id: '10', firstName: 'Ada', lastName: 'Lovelace' }) as KeycloakProfile;

    it('should map role to ADMIN when the ADMIN role is present', async () => {
      mockKeycloak.resourceAccess = createResourceAccessMock([
        ERASRoles.ADMIN,
        'someOtherRole',
      ]);
      mockKeycloak.loadUserProfile.and.returnValue(
        Promise.resolve(keycloakProfile())
      );
      service = TestBed.inject(UserDataService);
      await service.initUser();

      expect(service.user()?.role).toBe(ERASRoles.ADMIN);
    });

    it('should fall back to GUEST when no known ERAS role matches', async () => {
      mockKeycloak.resourceAccess = createResourceAccessMock([
        'unrelated-role',
      ]);
      mockKeycloak.loadUserProfile.and.returnValue(
        Promise.resolve(keycloakProfile())
      );
      service = TestBed.inject(UserDataService);
      await service.initUser();

      expect(service.user()?.role).toBe(ERASRoles.GUEST);
    });

    it('should fall back to GUEST when resourceAccess is undefined', async () => {
      mockKeycloak.resourceAccess = undefined;
      mockKeycloak.loadUserProfile.and.returnValue(
        Promise.resolve(keycloakProfile())
      );
      service = TestBed.inject(UserDataService);
      await service.initUser();

      expect(service.user()?.role).toBe(ERASRoles.GUEST);
    });

    it('BUG: throws when resourceAccess exists but has no entry for our clientId', async () => {
      mockKeycloak.resourceAccess = { 'some-other-client': { roles: [] } };
      mockKeycloak.loadUserProfile.and.returnValue(
        Promise.resolve(keycloakProfile())
      );
      service = TestBed.inject(UserDataService);

      await expectAsync(service.initUser()).toBeRejected();
    });
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
