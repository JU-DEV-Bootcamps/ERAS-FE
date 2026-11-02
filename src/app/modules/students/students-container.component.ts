import { Component, computed, inject } from '@angular/core';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { ERASPermissions } from '@core/services/permissions/permission.policies';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ImportStudentsComponent } from '@modules/imports/components/import-students/import-students.component';
import { StudentsListComponent } from './students-list/students-list.component';

@Component({
  selector: 'app-students',
  imports: [ImportStudentsComponent, StudentsListComponent],
  template: `
    @if (showList()) {
      <app-students-list></app-students-list>
    } @else {
      <app-import-students></app-import-students>
    }
  `,
})
export class StudentsContainerComponent {
  private readonly featureFlags = inject(FeatureFlagsService);
  private readonly permissions = inject(PermissionsService);
  // A professional only has the list (the import screen is not for them), whatever the flag says.
  showList = computed(
    () =>
      this.featureFlags.isEnabled(FEATURE_FLAGS.studentList) ||
      !this.permissions.can(ERASPermissions.CAN_MANAGE_STUDENTS)
  );
}
