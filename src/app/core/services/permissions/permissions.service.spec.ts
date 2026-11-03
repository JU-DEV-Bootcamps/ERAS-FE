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
    const response = service.can(ERASPermissions.CAN_CREATE_SERVICES);

    expect(response).toBeFalse();
  });

  it('can method should return true if PermissionCheck returns true', () => {
    userSignal.set({ role: ERASRoles.ADMIN });
    const response = service.can(ERASPermissions.CAN_CREATE_SERVICES);

    expect(response).toBeTrue();
  });

  it('can method should return false if PermissionCheck returns false', () => {
    userSignal.set({ role: ERASRoles.PROFESSIONAL });

    const response = service.can(ERASPermissions.CAN_CREATE_SERVICES);

    expect(response).toBeFalse();
  });

  describe('student permissions', () => {
    const allowed = (
      permission: ERASPermissions,
      role: ERASRoles | undefined
    ): boolean => {
      userSignal.set({ role });
      return service.can(permission);
    };

    it('CAN_MANAGE_STUDENTS is for administrators and officers only', () => {
      expect(
        allowed(ERASPermissions.CAN_MANAGE_STUDENTS, ERASRoles.ADMIN)
      ).toBeTrue();
      expect(
        allowed(ERASPermissions.CAN_MANAGE_STUDENTS, ERASRoles.OFFICER)
      ).toBeTrue();
      expect(
        allowed(ERASPermissions.CAN_MANAGE_STUDENTS, ERASRoles.PROFESSIONAL)
      ).toBeFalse();
      expect(
        allowed(ERASPermissions.CAN_MANAGE_STUDENTS, ERASRoles.GUEST)
      ).toBeFalse();
    });

    it('CAN_ADD_STUDENT_INTERVENTIONS is for administrators and professionals only', () => {
      expect(
        allowed(ERASPermissions.CAN_ADD_STUDENT_INTERVENTIONS, ERASRoles.ADMIN)
      ).toBeTrue();
      expect(
        allowed(
          ERASPermissions.CAN_ADD_STUDENT_INTERVENTIONS,
          ERASRoles.PROFESSIONAL
        )
      ).toBeTrue();
      expect(
        allowed(
          ERASPermissions.CAN_ADD_STUDENT_INTERVENTIONS,
          ERASRoles.OFFICER
        )
      ).toBeFalse();
      expect(
        allowed(ERASPermissions.CAN_ADD_STUDENT_INTERVENTIONS, ERASRoles.GUEST)
      ).toBeFalse();
    });

    it('CAN_MANAGE_ANY_STUDENT_INTERVENTION is for administrators only', () => {
      expect(
        allowed(
          ERASPermissions.CAN_MANAGE_ANY_STUDENT_INTERVENTION,
          ERASRoles.ADMIN
        )
      ).toBeTrue();
      expect(
        allowed(
          ERASPermissions.CAN_MANAGE_ANY_STUDENT_INTERVENTION,
          ERASRoles.PROFESSIONAL
        )
      ).toBeFalse();
      expect(
        allowed(
          ERASPermissions.CAN_MANAGE_ANY_STUDENT_INTERVENTION,
          ERASRoles.OFFICER
        )
      ).toBeFalse();
    });
  });
});
