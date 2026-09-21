import { TestBed } from '@angular/core/testing';

import { PermissionsService } from './permissions.service';
import { UserDataService } from '../access/user-data.service';
import { ERASPermissions } from './permission.policies';
import { ERASRoles, Profile } from '@core/models/profile.model';
import { signal } from '@angular/core';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let userSignal: ReturnType<typeof signal<Profile | null>>;

  beforeEach(() => {
    userSignal = signal<Profile | null>(null);
    const userDataServiceMock = {
      user: userSignal,
    };

    TestBed.configureTestingModule({
      providers: [{ provide: UserDataService, useValue: userDataServiceMock }],
    });
    service = TestBed.inject(PermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can method should return false if userRole is undefined', () => {
    userSignal.set({});
    const response = service.can(ERASPermissions.CAN_CREATE_PROFESSIONALS);

    expect(response).toBeFalse();
  });

  it('can method should return true if PermissionCheck returns true', () => {
    userSignal.set({ role: ERASRoles.ADMIN });
    const response = service.can(ERASPermissions.CAN_CREATE_PROFESSIONALS);

    expect(response).toBeTrue();
  });

  it('can method should return false if PermissionCheck returns false', () => {
    userSignal.set({ role: ERASRoles.PROFESSIONAL });

    const response = service.can(ERASPermissions.CAN_CREATE_PROFESSIONALS);

    expect(response).toBeFalse();
  });
});
