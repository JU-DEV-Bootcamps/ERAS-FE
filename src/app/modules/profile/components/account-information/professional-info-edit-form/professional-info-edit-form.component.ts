import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { PROFESSIONAL_PROFILE_MESSAGES } from '@core/constants/messages';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import { DynamicField } from '@core/factories/forms/form-factory.interface';
import { ProfessionalProfile } from '@core/models/professional-profile.model';
import { ProfessionalProfileService } from '@core/services/api/professional-profile.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { ProfessionalProfileStore } from '@core/store/professional-profile.store';
import { areObjectsEqual } from '@core/utils/helpers/are-objects-equal';

@Component({
  selector: 'app-professional-info-edit-form',
  imports: [MatButtonModule, FormFactoryComponent],
  templateUrl: './professional-info-edit-form.component.html',
  styleUrl: './professional-info-edit-form.component.scss',
})
export class ProfessionalInfoEditFormComponent implements OnInit {
  private readonly store = inject(ProfessionalProfileStore);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);
  private readonly professionalProfileService = inject(
    ProfessionalProfileService
  );
  private readonly destroyRef = inject(DestroyRef);

  // UnsavedChangesGuardService.requestClose() only ever calls dialogRef.close();
  // there is no real dialog here since editing happens inline in the card.
  private readonly dialogRefStub = {
    close: () => {
      //smth
    },
  } as unknown as MatDialogRef<unknown>;

  saved = output<void>();
  cancelled = output<void>();

  formFields: DynamicField[] = [];
  form!: FormGroup;
  errorMessage = signal<string | null>(null);

  private initialFormValue: Record<string, unknown> = {};

  ngOnInit(): void {
    const profile = this.store.profile();

    this.formFields = [
      {
        type: 'text',
        name: 'position',
        label: 'Position',
        value: profile.position,
      },
      {
        type: 'text',
        name: 'faculty',
        label: 'Faculty',
        value: profile.faculty,
        validators: [Validators.required],
      },
      {
        type: 'text',
        name: 'officeHours',
        label: 'Office Hours',
        value: profile.officeHours,
      },
      {
        type: 'textarea',
        name: 'subjectsTaught',
        label: 'Subjects Taught (comma separated)',
        value: profile.subjectsTaught.join(', '),
        floatingLabel: 'always',
      },
      {
        type: 'textarea',
        name: 'courses',
        label: 'Courses (one per line: CODE - Course Name)',
        value: profile.courses
          .map(course => `${course.code} - ${course.name}`)
          .join('\n'),
        floatingLabel: 'always',
      },
    ];
  }

  setFormGroup(form: FormGroup): void {
    this.form = form;
    this.initialFormValue = form.getRawValue();
  }

  hasUnsavedChanges(): boolean {
    return !areObjectsEqual(this.initialFormValue, this.form.getRawValue());
  }

  save(): void {
    if (this.form.invalid) return;

    const { position, faculty, officeHours, subjectsTaught, courses } =
      this.form.getRawValue();

    const profile: ProfessionalProfile = {
      position,
      faculty,
      officeHours,
      subjectsTaught: this.parseSubjects(subjectsTaught),
      courses: this.parseCourses(courses),
    };

    this.errorMessage.set(null);
    this.professionalProfileService
      .updateMyProfessionalProfile(profile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.store.setProfessionalProfile(updated);
          this.saved.emit();
        },
        error: error => {
          console.error('Error while saving professional profile', error);
          this.errorMessage.set(PROFESSIONAL_PROFILE_MESSAGES.SAVE_ERROR);
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

  private parseSubjects(value: string): string[] {
    return (value ?? '')
      .split(',')
      .map(subject => subject.trim())
      .filter(Boolean);
  }

  private parseCourses(value: string): ProfessionalProfile['courses'] {
    return (value ?? '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [code, ...rest] = line.split(' - ');
        return { code: code.trim(), name: rest.join(' - ').trim() };
      });
  }
}
