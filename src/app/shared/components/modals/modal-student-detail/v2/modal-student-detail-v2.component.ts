import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentDetailV2Component } from './student-detail-v2/student-detail-v2.component';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';

@Component({
  selector: 'app-modal-student-detail',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    StudentDetailV2Component,
  ],
  templateUrl: './modal-student-detail-v2.component.html',
  styleUrl: './modal-student-detail-v2.component.scss',
})
export class ModalStudentDetailV2Component {
  readonly data = inject(MAT_DIALOG_DATA);
  private featureFlags = inject(FeatureFlagsService);
  showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.studentDetails);
}
