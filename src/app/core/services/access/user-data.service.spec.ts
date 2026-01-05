import { TestBed } from '@angular/core/testing';
import keycloak from 'keycloak-js';
import { UserDataService } from './user-data.service';
import { Profile } from '@core/models/profile.model';

interface KeycloakMock {
  loadUserProfile: () => Promise<unknown>;
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
    expect(sessionStorage.getItem('erasUserProfile')).toEqual(
      JSON.stringify(profile)
    );
  });

  it('Should be set as null if wrong data is passed.', () => {
    sessionStorage.setItem('erasUserProfile', 'wrong data');
    service = TestBed.inject(UserDataService);

    expect(service.user()).toBeNull();
    expect(sessionStorage.getItem('erasUserProfile')).toBeNull();
  });

  it('Should fill user, if current user is null, at initUser method.', async () => {
    const profile: Profile = { firstName: 'user1', id: '2' } as Profile;
    mockKeycloak.loadUserProfile.and.returnValue(Promise.resolve(profile));
    service = TestBed.inject(UserDataService);
    await service.initUser();

    expect(mockKeycloak.loadUserProfile).toHaveBeenCalled();
    expect(service.user()).toEqual(profile);
    expect(sessionStorage.getItem('erasUserProfile')).toEqual(
      JSON.stringify(profile)
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
});
