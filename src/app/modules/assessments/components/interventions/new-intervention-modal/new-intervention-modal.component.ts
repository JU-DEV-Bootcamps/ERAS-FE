import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  inject,
  Inject,
  Injector,
  OnInit,
  signal,
  computed,
  DestroyRef,
  afterNextRender,
} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import { InterventionType } from '@core/models/assessment.model';
import {
  AddInterventionPayload,
  InterventionService,
} from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InterventionModel } from '@core/models/assessment.model';
import { map, of, concatMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ACTIVITY_OPTIONS,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  AREA_OPTIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES,
  MODE_OPTIONS,
  RISK_OPTIONS,
  TYPE_OPTIONS,
} from '../interventions.constants';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';

export interface StudentLookup {
  value: number;
  label: string;
  riskLevel?: number;
}

export interface NewInterventionDialogData {
  assessmentId: number;
  professional: { value: string; label: string };
  students: StudentLookup[];
  intervention?: InterventionModel;
}

@Component({
  selector: 'app-new-intervention-modal',
  imports: [
    FormsModule,
    FormFactoryComponent,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './new-intervention-modal.component.html',
  styleUrl: '../../../styles/assessments-modal-styles.scss',
})
export class NewInterventionModalComponent implements FormCreation, OnInit {
  private readonly interventionService = inject(InterventionService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);
  private readonly injector = inject(Injector);

  existingAttachments: string[] = [];
  attachmentsToDelete: string[] = [];

  isGroup = signal<boolean>(false);
  studentsSelected = signal<number[]>([]);

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;
  isSubmitting = false;

  private formSettling = true;
  private isSwitchingType = false;

  readonly numberOfParticipants = computed(() => this.data.students.length);

  readonly selectedStudentCount = computed(() => {
    if (!this.form) return 0;
    const value = this.form.get('students')?.value;

    if (this.isGroup()) {
      return Array.isArray(value) ? value.length : 0;
    }
    return value ? 1 : 0;
  });

  get isSubmitDisabled(): boolean {
    return (
      !this.form || this.form.invalid || this.form.pristine || this.isSubmitting
    );
  }

  constructor(
    public dialogRef: MatDialogRef<NewInterventionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewInterventionDialogData
  ) {
    const initialIsGroup = this.data.students.length > 1;
    this.isGroup.set(initialIsGroup);

    this.unsavedChangesGuard.attach(
      this.dialogRef,
      () => this.form?.dirty ?? false
    );
  }

  ngOnInit(): void {
    this.buildFormFields();
  }

  private buildFormFields(forcedStudentsValue?: number | number[]): void {
    const isGroupForm = this.data.students.length > 1;

    const groupDefaultIds =
      (Array.isArray(forcedStudentsValue)
        ? forcedStudentsValue
        : this.data.students.map(s => Number(s.value))) || [];

    const individualDefaultId =
      (!Array.isArray(forcedStudentsValue)
        ? forcedStudentsValue
        : forcedStudentsValue[0]) ?? this.data.students[0]?.value;

    const defaultStudentIds = this.isGroup()
      ? groupDefaultIds
      : [individualDefaultId];
    this.studentsSelected.set(defaultStudentIds);

    const topFields: DynamicField[] = [
      {
        type: 'date',
        name: 'date',
        label: 'Date',
        placeholder: 'Select a date',
        validators: [Validators.required],
        floatingLabel: 'always',
        value: new Date(),
      },
      {
        type: 'select',
        name: 'type',
        label: 'Intervention Type',
        placeholder: 'Select intervention',
        options: TYPE_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.isGroup()
          ? InterventionType.Group
          : InterventionType.Individual,
        disabled: !isGroupForm,
      },
    ];
    const optionalFields: DynamicField[] = [
      {
        type: 'select',
        name: 'activity',
        label: 'Activity',
        placeholder: 'Select activity',
        options: ACTIVITY_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
      },
      {
        type: 'select',
        name: 'area',
        label: 'Area',
        placeholder: 'Select area',
        options: AREA_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
      },
      {
        type: 'select',
        name: 'mode',
        label: 'Mode',
        placeholder: 'Select mode',
        options: MODE_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
      },
    ];

    const studentsGroupField: DynamicField = {
      type: 'searchableSelect',
      name: 'students',
      label: 'Student (s)',
      placeholder: 'Select students',
      options: this.data.students,
      validators: [Validators.required],
      multipleSelect: true,
      floatingLabel: 'always',
      selectConfig: {
        displayMode: 'chips',
      },
      value: groupDefaultIds,
    };

    const studentsIndividualField: DynamicField = {
      type: 'select',
      name: 'students',
      label: 'Student',
      placeholder: 'Select student',
      options: this.data.students,
      validators: [Validators.required],
      floatingLabel: 'always',
      value: individualDefaultId,
    };

    const bottomFields: DynamicField[] = [
      {
        type: 'select',
        name: 'riskLevelName',
        label: 'Risk Level',
        options: RISK_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: {
          displayMode: 'chips',
        },
        value: RISK_OPTIONS.at(1)?.label,
      },
      {
        type: 'select',
        name: 'professionalId',
        label: 'Professional',
        placeholder: this.data.professional.label,
        options: [this.data.professional],
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.professional.value,
        disabled: true,
      },
      {
        type: 'file',
        name: 'uploadInput',
        label: 'Attached Document (s)',
        placeholder: 'Upload File (s)',
        fileConfig: {
          maxFiles: MAX_FILES,
          maxSizeMb: MAX_FILE_SIZE_BYTES,
          allowedExtensions: ALLOWED_EXTENSIONS,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
          onFileRemoved: fileIndex => this.removeExistingAttachment(fileIndex),
          prefillFileNames: [],
        },
        floatingLabel: 'always',
      },
      {
        type: 'textarea',
        name: 'comments',
        label: 'Intervention Notes',
        placeholder: 'Remarks, observations and follow-up notes...',
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
        floatingLabel: 'always',
      },
    ];
    this.formFields = this.isGroup()
      ? [...topFields, studentsGroupField, ...bottomFields, ...optionalFields]
      : [
          ...topFields,
          studentsIndividualField,
          ...bottomFields,
          ...optionalFields,
        ];
  }

  private handleTypeSwitch(targetType: InterventionType): void {
    const isNowGroup = targetType === InterventionType.Group;
    if (isNowGroup === this.isGroup()) return;

    let nextStudentValue: number | number[];
    if (isNowGroup) {
      nextStudentValue = this.data.students.map(s => Number(s.value));
    } else {
      const current = this.form.get('students')?.value;
      nextStudentValue = Array.isArray(current)
        ? Number(current[0])
        : Number(current) || this.data.students[0]?.value;
    }

    this.isSwitchingType = true;
    this.isGroup.set(isNowGroup);
    this.form.get('type')?.setValue(targetType, { emitEvent: false });

    this.buildFormFields(nextStudentValue);

    afterNextRender(
      () => {
        this.form.get('students')?.setValue(nextStudentValue, {
          emitEvent: false,
        });
        this.form.markAsDirty();
        this.isSwitchingType = false;
      },
      { injector: this.injector }
    );
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;

    if (this.isGroup()) {
      const ctrl = this.form.get('students');
      if (ctrl && !Array.isArray(ctrl.value)) {
        const current = ctrl.value;
        ctrl.setValue(current ? [current] : [], { emitEvent: false });
      }
    }

    afterNextRender(
      () => {
        this.formSettling = false;
      },
      { injector: this.injector }
    );

    this.form
      .get('type')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (this.isSwitchingType) return;
        this.handleTypeSwitch(value as InterventionType);
      });

    this.form
      .get('students')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (this.formSettling || this.isSwitchingType) return;
        if (!this.isGroup()) return;

        const selected: number[] = Array.isArray(value)
          ? (value as number[])
          : value !== null && value !== undefined
            ? [value as number]
            : [];

        if (selected.length < 2) {
          this.handleTypeSwitch(InterventionType.Individual);
        }
      });
  }

  submitIntervention(): void {
    if (this.form.invalid) return;

    const payload = this.buildPayload();
    this.isSubmitting = true;

    this.interventionService
      .createIntervention(payload)
      .pipe(
        concatMap((created: InterventionModel) => {
          if (this.form.value.uploadInput.length === 0) return of(created);
          return this.interventionService
            .uploadAttachments(created.id!, this.form.value.uploadInput)
            .pipe(map(() => created));
        })
      )
      .subscribe({
        next: () => {
          const toast: ToastNotificationData = {
            title: 'Intervention created successfully',
            message: `The ${this.isGroup() ? 'group' : 'individual'} intervention has been registered.`,
            type: 'success',
          };
          this.toastService.showToast(toast);
        },
        error: (err: HttpErrorResponse) => {
          const toast: ToastNotificationData = {
            title: 'Form Submission Failed',
            message: `${err.statusText}: ${err.error?.title ?? 'There was an error submitting the form. Please try again later.'}`,
            type: 'error',
          };
          this.toastService.showToast(toast, true);
          this.isSubmitting = false;
        },
        complete: () => {
          this.dialogRef.close(true);
        },
      });
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  private buildPayload(): AddInterventionPayload {
    const v = this.form.value;

    const isGroup = this.isGroup();

    const studentIds: number[] = isGroup
      ? (v.students as string[]).map(Number)
      : [Number(v.students)];

    const kindIntervention = this.formFields.find(
      field => field.name === 'type'
    )?.value;

    return {
      assessmentId: this.data.assessmentId,
      intervention: {
        kind: v.type ?? kindIntervention,
        dateUtc: new Date(v.date).toISOString(),
        activity: v.activity,
        mode: v.mode,
        comments: v.comments,
        professional: this.data.professional.label,
        studentIds,
        area: v.area,
        numberOfParticipants: studentIds.length,
        attachments: [],
        riskLevelName: v.riskLevelName,
      },
    };
  }

  closeAndResetDialog(): void {
    this.dialogRef.close();
  }

  removeExistingAttachment(index: number): void {
    const pathToRemove = this.existingAttachments[index];
    this.attachmentsToDelete.push(this.getFileName(pathToRemove));
    this.existingAttachments = this.existingAttachments.filter(
      (_, i) => i !== index
    );
    this.form.markAsDirty();
  }

  getFileName(path: string): string {
    if (path === undefined) return '';
    return path.split('/').pop() ?? path;
  }
}
