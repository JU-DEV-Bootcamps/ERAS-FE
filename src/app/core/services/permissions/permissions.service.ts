import { computed, inject, Injectable } from '@angular/core';
import { UserDataService } from '../access/user-data.service';
import {
  ERASPermissions,
  PermissionChecks,
  PermissionContext,
  PermissionsRoles,
} from './permission.policies';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private userDataService = inject(UserDataService);
  private userRole = computed(() => this.userDataService.user()?.role);

  /**
   * Checks if current user can execute the passed action based on their role.
   * @param permission the action to be evaluated.
   * @param context object containing extra information to validate.
   * @returns { boolean } `true` if user has required role; `false` otherwise.
   */
  can(permission: ERASPermissions, context?: PermissionContext): boolean {
    const currentUserRole = this.userRole();
    if (!currentUserRole) return false;

    const requiredRoles = PermissionsRoles[permission];
    return PermissionChecks[permission](
      currentUserRole,
      requiredRoles,
      context
    );
  }
}
