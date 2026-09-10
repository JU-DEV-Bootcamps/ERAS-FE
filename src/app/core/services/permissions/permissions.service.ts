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
