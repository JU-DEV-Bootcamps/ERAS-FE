import { Component, inject, OnInit, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AVATAR_COLORS } from '@core/constants/avatarColors';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import { DynamicField } from '@core/factories/forms/form-factory.interface';
import { UserProfile } from '@core/models/user-profile.model';
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
            name: 'role',
            label: 'Role',
            value: profile.role,
            disabled: true,
          },
          {
            type: 'text',
            name: 'employeeId',
            label: 'Employee ID',
            value: profile.employeeId,
          },
          {
            type: 'text',
            name: 'department',
            label: 'Department',
            value: profile.department,
          },
          {
            type: 'text',
            name: 'phone',
            label: 'Phone',
            value: profile.phone,
          },
          {
            type: 'textarea',
            name: 'about',
            label: 'About',
            value: profile.about,
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

    this.userProfileService
      .updateMyProfile(userId, this.form.getRawValue())
      .subscribe({
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
