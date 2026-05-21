import { Component, computed, inject } from '@angular/core';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { ImportStudentsComponent } from '@modules/imports/components/import-students/import-students.component';
import { StudentsListComponent } from './students-list/students-list.component';

@Component({
  selector: 'app-students',
  imports: [ImportStudentsComponent, StudentsListComponent],
  template: `
    @if (showV2()) {
      <app-students-list></app-students-list>
    } @else {
      <app-import-students></app-import-students>
    }
  `,
})
export class StudentsContainerComponent {
  private readonly featureFlags = inject(FeatureFlagsService);
  showV2 = computed(() =>
    this.featureFlags.isEnabled(FEATURE_FLAGS.studentList)
  );
}
