import { ERASRoles } from '@core/models/profile.model';
import {
  ERASPermissions,
  PermissionChecks,
  PermissionContext,
  PermissionsRoles,
} from './permission.policies';

describe('Permissions policy functions', () => {
  describe('CAN_CREATE_SERVICES', () => {
    const permissionCheck =
      PermissionChecks[ERASPermissions.CAN_CREATE_SERVICES];
    const enabledRoles = PermissionsRoles[ERASPermissions.CAN_CREATE_SERVICES];

    it('should return true for ERAS Administrator', () => {
      expect(permissionCheck(ERASRoles.ADMIN, enabledRoles)).toBeTrue();
    });

    it('should return false for ERAS Students Service Officer', () => {
      expect(permissionCheck(ERASRoles.OFFICER, enabledRoles)).toBeFalse();
    });

    it('should return false for ERAS Professional', () => {
      expect(permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles)).toBeFalse();
    });
  });
  describe('CAN_SEE_ASSESSMENT', () => {
    const permissionCheck =
      PermissionChecks[ERASPermissions.CAN_SEE_ASSESSMENT];
    const enabledRoles = PermissionsRoles[ERASPermissions.CAN_SEE_ASSESSMENT];

    it('should return true for ERAS Administrator', () => {
      expect(permissionCheck(ERASRoles.ADMIN, enabledRoles)).toBeTrue();
    });

    it('should return false for ERAS Students Service Officer', () => {
      expect(permissionCheck(ERASRoles.OFFICER, enabledRoles)).toBeFalse();
    });

    it('should return false for ERAS Professional', () => {
      expect(permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles)).toBeFalse();
    });

    it('should return true if ERAS Professional is the assigned professional', () => {
      const context: PermissionContext = {
        assignedProfessional: 'Tomás Torres',
        currentProfessional: 'Tomás Torres',
      };

      expect(
        permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles, context)
      ).toBeTrue();
    });

    it('should return false if ERAS Professional is not the assigned professional', () => {
      const context: PermissionContext = {
        assignedProfessional: 'Tomás Torres',
        currentProfessional: 'Mario Mendoza',
      };

      expect(
        permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles, context)
      ).toBeFalse();
    });
  });
  describe('CAN_SEE_INTERVENTION', () => {
    const permissionCheck =
      PermissionChecks[ERASPermissions.CAN_SEE_INTERVENTION];
    const enabledRoles = PermissionsRoles[ERASPermissions.CAN_SEE_INTERVENTION];

    it('should return true for ERAS Administrator', () => {
      expect(permissionCheck(ERASRoles.ADMIN, enabledRoles)).toBeTrue();
    });

    it('should return false for ERAS Students Service Officer', () => {
      expect(permissionCheck(ERASRoles.OFFICER, enabledRoles)).toBeFalse();
    });

    it('should return false for ERAS Professional', () => {
      expect(permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles)).toBeFalse();
    });

    it('should return true if ERAS Professional is the assigned professional', () => {
      const context: PermissionContext = {
        assignedProfessional: 'Tomás Torres',
        currentProfessional: 'Tomás Torres',
      };

      expect(
        permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles, context)
      ).toBeTrue();
    });

    it('should return false if ERAS Professional is not the assigned professional', () => {
      const context: PermissionContext = {
        assignedProfessional: 'Tomás Torres',
        currentProfessional: 'Mario Mendoza',
      };

      expect(
        permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles, context)
      ).toBeFalse();
    });
  });
  describe('CAN_MANAGE_ASSESSMENT', () => {
    const permissionCheck =
      PermissionChecks[ERASPermissions.CAN_MANAGE_ASSESSMENT];
    const enabledRoles =
      PermissionsRoles[ERASPermissions.CAN_MANAGE_ASSESSMENT];

    it('should return true for ERAS Administrator', () => {
      expect(permissionCheck(ERASRoles.ADMIN, enabledRoles)).toBeTrue();
    });

    it('should return true for ERAS Students Service Officer', () => {
      expect(permissionCheck(ERASRoles.OFFICER, enabledRoles)).toBeTrue();
    });

    it('should return false for ERAS Professional', () => {
      expect(permissionCheck(ERASRoles.PROFESSIONAL, enabledRoles)).toBeFalse();
    });
  });
});

describe('policy map integrity', () => {
  it('should have a function for every declared permission key', () => {
    const expectedKeys = Object.keys(ERASPermissions);
    expectedKeys.forEach(key =>
      expect(typeof PermissionChecks[key as ERASPermissions]).toBe('function')
    );
  });
});
