import { NgClass, NgFor } from '@angular/common';
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
  ViewChild,
} from '@angular/core';
import {
  FormControl,
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
import {
  InterventionType,
  InterventionModel,
  UpdateInterventionModel,
  UpdateInterventionPayload,
} from '@core/models/assessment.model';
import { InterventionService } from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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
  STATUS_OPTIONS,
  StudentLookup,
  TYPE_OPTIONS,
} from '../interventions.constants';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { StagedFile } from '@core/models/attachment.model';
import { AttachmentManagerComponent } from '@shared/components/attachment-manager/attachment-manager.component';

export interface NewInterventionDialogData {
  assessmentId: number;
  professional: { value: string; label: string };
  students: StudentLookup[];
  intervention?: InterventionModel;
}

@Component({
  selector: 'app-edit-intervention-modal',
  standalone: true,
  imports: [
    FormsModule,
    FormFactoryComponent,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    NgFor,
    ReactiveFormsModule,
    AttachmentManagerComponent,
  ],
  templateUrl: './edit-intervention-modal.component.html',
  styleUrls: [
    '../../../styles/assessments-modal-styles.scss',
    './edit-intervention-modal.component.scss',
  ],
})
export class EditInterventionModalComponent implements FormCreation, OnInit {
  private readonly interventionService = inject(InterventionService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);
  private readonly injector = inject(Injector);

  @ViewChild('attachmentManager')
  private readonly attachmentManager!: AttachmentManagerComponent;

  attendedStudentIdsModel: string[] = [];

  isGroup = signal<boolean>(false);
  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;
  isSubmitting = signal(false);

  attendance = signal<{ student: StudentLookup; attended: boolean }[]>([]);
  attendedStudentIds = signal<string[]>([]);

  private formSettling = true;
  private isSwitchingType = false;

  readonly numberOfParticipants = computed(() => this.data.students.length);

  get isSubmitDisabled(): boolean {
    return (
      !this.form ||
      this.form.invalid ||
      this.form.pristine ||
      this.isSubmitting()
    );
  }

  constructor(
    public dialogRef: MatDialogRef<EditInterventionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewInterventionDialogData
  ) {
    this.unsavedChangesGuard.attach(
      this.dialogRef,
      () => this.form?.dirty ?? false
    );
  }

  ngOnInit(): void {
    const intervention = this.data.intervention!;
    const isActuallyGroup = intervention.kind === InterventionType.Group;
    this.isGroup.set(isActuallyGroup);
    this.prefillForm();
    this.buildFormFields();
  }

  private buildFormFields(forcedStudentsValue?: number | number[]): void {
    const isGroupForm = this.data.students.length > 1;
    const currentValues = this.form?.getRawValue() || {};
    const intervention = this.data.intervention!;

    let studentsValue: number | number[];
    if (forcedStudentsValue !== undefined) {
      studentsValue = forcedStudentsValue;
    } else if (this.isGroup()) {
      studentsValue = Array.isArray(currentValues.students)
        ? currentValues.students
        : intervention.studentIds;
    } else {
      studentsValue =
        (!Array.isArray(currentValues.students)
          ? currentValues.students
          : currentValues.students[0]) ?? intervention.studentIds[0];
    }

    const topFields: DynamicField[] = [
      {
        type: 'date',
        name: 'date',
        label: 'Date',
        validators: [Validators.required],
        floatingLabel: 'always',
        value: currentValues.date || intervention.dateUtc,
      },
      {
        type: 'select',
        name: 'type',
        label: 'Intervention Type',
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
        options: ACTIVITY_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: currentValues.activity,
      },
      {
        type: 'select',
        name: 'area',
        label: 'Area',
        options: AREA_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: currentValues.area,
      },
      {
        type: 'select',
        name: 'mode',
        label: 'Mode',
        options: MODE_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: currentValues.mode,
      },
    ];

    const studentsGroupField: DynamicField = {
      type: 'searchableSelect',
      name: 'students',
      label: 'Student (s)',
      options: this.data.students,
      validators: [Validators.required],
      multipleSelect: true,
      floatingLabel: 'always',
      selectConfig: { displayMode: 'chips' },
      value: studentsValue,
    };

    const studentsIndividualField: DynamicField = {
      type: 'select',
      name: 'students',
      label: 'Student',
      options: this.data.students,
      validators: [Validators.required],
      floatingLabel: 'always',
      value: studentsValue,
    };

    const bottomFields: DynamicField[] = [
      {
        type: 'select',
        name: 'riskLevelName',
        label: 'Risk Level',
        options: RISK_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: { displayMode: 'chips' },
        value: currentValues.riskLevelName || RISK_OPTIONS.at(1)?.label,
      },
      {
        type: 'select',
        name: 'status',
        label: 'Status',
        options: STATUS_OPTIONS.filter(s =>
          s.allowed.includes(intervention.status ?? '')
        ),
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: { displayMode: 'chips' },
        value: currentValues.status || intervention.status,
      },
      {
        type: 'select',
        name: 'professional',
        label: 'Professional',
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
        hidden: true,
        fileConfig: {
          maxFiles: MAX_FILES,
          maxSizeMb: MAX_FILE_SIZE_BYTES,
          allowedExtensions: ALLOWED_EXTENSIONS,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        },
        floatingLabel: 'always',
      },
      {
        type: 'textarea',
        name: 'comments',
        label: 'Intervention Notes',
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
        floatingLabel: 'always',
        value: currentValues.comments,
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

    if (this.form?.contains('endRiskLevelName')) {
      this.appendEndRiskLevelField();
    }
  }

  private handleTypeSwitch(targetType: InterventionType): void {
    const isNowGroup = targetType === InterventionType.Group;

    let nextStudentValue: number | number[];
    if (isNowGroup) {
      nextStudentValue = this.data.students.map(s => Number(s.value));
    } else {
      const current = this.form.get('students')?.value;
      nextStudentValue = Array.isArray(current)
        ? Number(current[0])
        : Number(current);
    }

    this.isSwitchingType = true;

    this.form.get('type')?.setValue(targetType, { emitEvent: false });

    this.isGroup.set(isNowGroup);
    this.buildFormFields(nextStudentValue);

    afterNextRender(
      () => {
        this.form.get('students')?.setValue(nextStudentValue, {
          emitEvent: false,
        });

        if (!isNowGroup) {
          this.attendedStudentIds.set([]);
          this.attendedStudentIdsModel = [];
          this.buildAttendance();
        }

        this.form.markAsDirty();
        this.isSwitchingType = false;
      },
      { injector: this.injector }
    );
  }

  private _prefillValues: Record<string, unknown> = {};

  private prefillForm(): void {
    const iv = this.data.intervention!;
    const isGroup = iv.kind === InterventionType.Group;

    this._prefillValues = {
      type: iv.kind,
      date: iv.dateUtc,
      activity: iv.activity,
      area: iv.area,
      mode: iv.mode,
      comments: iv.comments,
      riskLevelName: iv.riskLevelName,
      status: iv.status,
      students: isGroup
        ? Array.isArray(iv.studentIds)
          ? iv.studentIds
          : []
        : Array.isArray(iv.studentIds)
          ? iv.studentIds[0]
          : iv.studentIds,
    };

    const attended = Object.entries(iv.attendance ?? {})
      .filter(([, v]) => v)
      .map(([k]) => String(k));

    this.attendedStudentIds.set(attended);
    this.attendedStudentIdsModel = attended;
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;
    this.formSettling = true;
    this.form.patchValue(this._prefillValues, { emitEvent: false });
    this.form
      .get('type')
      ?.setValue(this._prefillValues['type'], { emitEvent: false });

    Object.values(this.form.controls).forEach(control => {
      control.updateValueAndValidity({ emitEvent: false });
    });
    afterNextRender(
      () => {
        setTimeout(() => {
          this.formSettling = false;
          if (
            this.isGroup() &&
            !Array.isArray(this.form.get('students')?.value)
          ) {
            const val = this.form.get('students')?.value;
            this.form
              .get('students')
              ?.setValue(val ? [val] : [], { emitEvent: false });
          }
        }, 100);
      },
      { injector: this.injector }
    );

    this.form
      .get('type')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (this.formSettling) return;

        if (
          value ===
          (this.isGroup()
            ? InterventionType.Group
            : InterventionType.Individual)
        )
          return;
        this.handleTypeSwitch(value as InterventionType);
      });

    this.form
      .get('students')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string | number | (string | number)[]) => {
        if (this.formSettling || this.isSwitchingType) return;
        if (this.isGroup() && Array.isArray(value) && value.length === 1) {
          this.handleTypeSwitch(InterventionType.Individual);
        }
      });

    this.form
      .get('status')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value === 'Finalized') {
          this.form.get('riskLevelName')?.disable();
          this.addEndRiskLevelField();
        } else {
          this.form.get('riskLevelName')?.enable();
          this.removeEndRiskLevelField();
        }
      });
  }

  private buildAttendance(): void {
    this.attendance.set(
      this.data.students.map(student => ({ student, attended: false }))
    );
  }

  onAttendanceChange(selectedValues: string[] | string | null): void {
    const asArray = !selectedValues
      ? []
      : Array.isArray(selectedValues)
        ? selectedValues
        : [String(selectedValues)];
    this.attendedStudentIds.set(asArray);
    this.attendedStudentIdsModel = asArray;
    this.form.markAsDirty();
  }

  onStagedFilesChange(staged: StagedFile[]): void {
    const control = this.form?.get('uploadInput');
    if (!control) return;

    const hasUploading = staged.some(s => s.status === 'uploading');
    const hasError = staged.some(s => s.status === 'error');

    if (hasUploading) {
      control.setErrors({ uploading: true });
    } else if (hasError) {
      control.setErrors({ uploadError: true });
    } else {
      control.setErrors(null);
    }

    control.markAsDirty();
  }

  submitIntervention(): void {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const payload = this.buildPayload();
    const values = this.form.getRawValue();

    const interventionDto: UpdateInterventionPayload = {
      dateUtc: new Date(values.date).toISOString(),
      activity: values.activity,
      area: values.area,
      numberOfParticipants: payload.intervention['numberOfParticipants'],
      professional: values.professional,
      comments: values.comments,
      studentIds: payload.intervention['studentIds'],
      attendance: payload.intervention['attendance'],
      mode: values.mode,
      kind: values.kind,
      status: values.status,
      remarks: values.remarks,
      uploadInput: values.uploadInput,
      riskLevelName: values.riskLevelName,
      endRiskLevelName: values.endRiskLevelName,
    };

    const { draftSessionId, attachmentIdsToRemove } =
      this.attachmentManager.getPendingChanges();

    const payloadUpdate: UpdateInterventionModel = {
      updateInterventionDto: interventionDto,
      attachmentIdsToRemove,
      draftSessionId,
    };

    this.interventionService
      .updateIntervention(
        this.data.assessmentId,
        this.data.intervention!.id!,
        payloadUpdate
      )
      .subscribe({
        next: () => {
          this.toastService.showToast({
            title: 'Intervention updated successfully',
            message: 'The intervention has been updated.',
            type: 'success',
          });
          this.dialogRef.close(true);
        },
        error: (err: HttpErrorResponse) => {
          this.toastService.showToast(
            {
              title: 'Update Failed',
              message: `${err.statusText}: ${err.error?.title ?? 'Error.'}`,
              type: 'error',
            },
            true
          );
          this.isSubmitting.set(false);
        },
      });
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  private buildPayload() {
    const v = this.form.getRawValue();
    const rawStudents = v.students as string | number | (string | number)[];
    const studentIds: number[] =
      this.isGroup() && Array.isArray(rawStudents)
        ? rawStudents.map(id => Number(id))
        : [Number(rawStudents)];

    const attendanceRecord: Record<number, boolean> = {};
    this.data.students.forEach(student => {
      attendanceRecord[Number(student.value)] =
        this.attendedStudentIds().includes(String(student.value));
    });

    const endRiskLevelName =
      v.endRiskLevelName && v.endRiskLevelName !== ''
        ? v.endRiskLevelName
        : null;

    return {
      assessmentId: this.data.assessmentId,
      intervention: {
        kind: v.type,
        dateUtc: new Date(v.date).toISOString(),
        activity: v.activity,
        mode: v.mode,
        comments: v.comments,
        professional: this.data.professional.label,
        studentIds,
        area: v.area,
        numberOfParticipants: studentIds.length,
        attendance: attendanceRecord,
        attachments: [],
        riskLevelName: v.riskLevelName,
        status: v.status,
        endRiskLevelName,
      },
    };
  }

  private appendEndRiskLevelField(): void {
    if (this.formFields.some(f => f.name === 'endRiskLevelName')) return;
    this.formFields = [
      ...this.formFields,
      {
        type: 'select',
        name: 'endRiskLevelName',
        label: 'End Risk Level',
        options: RISK_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: { displayMode: 'chips' },
        value: this.data.intervention?.endRiskLevelName || undefined,
      },
    ];
  }

  private addEndRiskLevelField(): void {
    if (!this.form.contains('endRiskLevelName')) {
      this.form.addControl(
        'endRiskLevelName',
        new FormControl(this.data.intervention?.endRiskLevelName ?? '', [
          Validators.required,
        ])
      );
    }
    this.appendEndRiskLevelField();
  }

  private removeEndRiskLevelField(): void {
    if (this.form.contains('endRiskLevelName')) {
      this.form.removeControl('endRiskLevelName');
    }
    this.formFields = this.formFields.filter(
      f => f.name !== 'endRiskLevelName'
    );
  }
}
