import { Component, inject, OnInit, output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AVATAR_COLORS } from '@core/constants/avatarColors';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import { DynamicField } from '@core/factories/forms/form-factory.interface';
import {
  UpdateUserProfileRequest,
  UserProfile,
} from '@core/models/user-profile.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { areObjectsEqual } from '@core/utils/helpers/are-objects-equal';

@Component({
  selector: 'app-profile-edit-form',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    FormFactoryComponent,
  ],
  templateUrl: './profile-edit-form.component.html',
  styleUrl: './profile-edit-form.component.scss',
})
export class ProfileEditFormComponent implements OnInit {
  private readonly userProfileService = inject(UserProfileService);
  private readonly userDataService = inject(UserDataService);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);

  // UnsavedChangesGuardService.requestClose() only ever calls dialogRef.close();
  // there is no real dialog here since editing happens inline in the card.
  private readonly dialogRefStub = {
    close: () => {
      //smth
    },
  } as unknown as MatDialogRef<unknown>;

  saved = output<UserProfile>();
  cancelled = output<void>();

  profile: UserProfile | null = null;
  isLoading = false;
  hasError = false;
  isSaving = false;

  formFields: DynamicField[] = [];
  form!: FormGroup;

  private initialFormValue: Record<string, unknown> = {};

  ngOnInit(): void {
    this.loadProfile();
  }

  get initials(): string {
    if (!this.profile) return '';
    return `${this.profile.firstName?.charAt(0) ?? ''}${this.profile.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }

  get avatarColor(): string {
    if (!this.profile) return AVATAR_COLORS[0];
    const name = `${this.profile.firstName}${this.profile.lastName}`;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  loadProfile(): void {
    this.isLoading = true;
    this.hasError = false;

    this.userProfileService.getMyProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.formFields = [
          {
            type: 'text',
            name: 'name',
            label: 'Name',
            value: `${profile.firstName} ${profile.lastName}`,
            disabled: true,
          },
          {
            type: 'text',
            name: 'email',
            label: 'Email',
            value: profile.email,
            disabled: true,
          },
          {
            type: 'text',
            name: 'employeeId',
            label: 'Employee ID',
            value: profile.employeeId,
            validators: [Validators.required, Validators.maxLength(50)],
          },
          {
            type: 'text',
            name: 'department',
            label: 'Department',
            value: profile.department,
            validators: [Validators.required, Validators.maxLength(100)],
          },
          {
            type: 'text',
            name: 'position',
            label: 'Position',
            value: profile.position,
            validators: [Validators.maxLength(100)],
          },
          {
            type: 'text',
            name: 'phone',
            label: 'Phone',
            value: profile.phone,
            validators: [Validators.required, Validators.maxLength(20)],
          },
          {
            type: 'text',
            name: 'role',
            label: 'Role',
            value: profile.role,
            disabled: true,
          },
          {
            type: 'textarea',
            name: 'about',
            label: 'About',
            value: profile.about,
            validators: [Validators.maxLength(2000)],
            floatingLabel: 'always',
          },
        ];
      },
      error: error => {
        this.hasError = true;
        this.isLoading = false;
        console.error('Error while fetching user profile', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  setFormGroup(form: FormGroup): void {
    this.form = form;
    this.initialFormValue = form.getRawValue();
  }

  hasUnsavedChanges(): boolean {
    return !areObjectsEqual(this.initialFormValue, this.form.getRawValue());
  }

  save(): void {
    if (this.form.invalid || !this.profile) return;

    const userId = this.userDataService.user()?.id;
    if (!userId) {
      console.error('Cannot update profile: missing user id');
      return;
    }

    this.isSaving = true;
    const { employeeId, department, position, phone, about } =
      this.form.getRawValue();
    const payload: UpdateUserProfileRequest = {
      employeeId,
      department,
      position,
      phone,
      about,
    };

    this.userProfileService.updateMyProfile(payload).subscribe({
      next: updatedProfile => {
        this.saved.emit(updatedProfile);
      },
      error: error => {
        this.isSaving = false;
        console.error('Error while updating user profile', error);
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  cancel(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRefStub, () => this.hasUnsavedChanges())
      .subscribe(shouldClose => {
        if (shouldClose) this.cancelled.emit();
      });
  }
}
