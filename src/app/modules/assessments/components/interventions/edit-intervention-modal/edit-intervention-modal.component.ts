import { NgClass, NgFor } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  inject,
  Inject,
  OnInit,
  signal,
  computed,
  DestroyRef,
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
} from '@core/models/assessment.model';
import {
  AddInterventionPayload,
  InterventionService,
} from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { of, concatMap, Observable, forkJoin } from 'rxjs';
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

  private _prefillValues: Record<string, unknown> = {};
  existingAttachments: string[] = [];
  attachmentsToDelete: string[] = [];
  attendedStudentIdsModel: string[] = [];

  isGroup = signal<boolean>(false);
  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;

  attendance = signal<{ student: StudentLookup; attended: boolean }[]>([]);
  attendedStudentIds = signal<string[]>([]);

  readonly numberOfParticipants = computed(() => this.data.students.length);

  get isSubmitDisabled(): boolean {
    return !this.form || this.form.invalid || this.form.pristine;
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
    this.isGroup.set(intervention.kind === InterventionType.Group);
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
        name: 'professionalId',
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
        fileConfig: {
          maxFiles: MAX_FILES,
          maxSizeMb: MAX_FILE_SIZE_BYTES,
          allowedExtensions: ALLOWED_EXTENSIONS,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
          onFileRemoved: i => this.removeExistingAttachment(i),
          prefillFileNames: (intervention.attachments ?? []).map(p =>
            this.getFileName(p)
          ),
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
    this.isGroup.set(isNowGroup);

    if (!isNowGroup) {
      this.attendedStudentIds.set([]);
      this.attendedStudentIdsModel = [];
    }

    const current = this.form.get('students')?.value;
    let nextStudentValue: number | number[];
    if (isNowGroup) {
      nextStudentValue = this.data.students.map(s => Number(s.value));
    } else {
      nextStudentValue = Array.isArray(current)
        ? Number(current[0])
        : Number(current);
    }

    this.buildFormFields(nextStudentValue);

    setTimeout(() => {
      this.form.get('type')?.setValue(targetType, { emitEvent: false });

      const safeValue = Array.isArray(nextStudentValue)
        ? nextStudentValue
        : [nextStudentValue];
      this.form.get('students')?.setValue(safeValue, { emitEvent: false });

      if (!isNowGroup) {
        this.buildAttendance();
      }
      this.form.markAsDirty();
    });
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;
    this.form.patchValue(this._prefillValues);

    this.form
      .get('type')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
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

  private prefillForm(): void {
    const iv = this.data.intervention!;
    this._prefillValues = {
      type: iv.kind,
      date: iv.dateUtc,
      activity: iv.activity,
      area: iv.area,
      mode: iv.mode,
      comments: iv.comments,
      riskLevelName: iv.riskLevelName,
      status: iv.status,
      students:
        iv.kind === InterventionType.Group ? iv.studentIds : iv.studentIds[0],
    };

    const attended = Object.entries(iv.attendance ?? {})
      .filter(([, v]) => v)
      .map(([k]) => String(k));

    this.attendedStudentIds.set(attended);
    this.attendedStudentIdsModel = attended;
    this.existingAttachments = iv.attachments ?? [];
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

  submitIntervention(): void {
    if (this.form.invalid) return;
    this.updateIntervention();
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  private buildPayload(): AddInterventionPayload {
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

  private updateIntervention(): void {
    const iv = this.data.intervention!;
    const payload = this.buildPayload();
    const updated: InterventionModel = {
      ...iv,
      ...payload.intervention,
      id: iv.id,
      attachments: this.existingAttachments,
    } as InterventionModel;

    const deleteObs: Observable<unknown> = this.attachmentsToDelete.length
      ? forkJoin(
          this.attachmentsToDelete.map(fileName =>
            this.interventionService.deleteAttachment(iv.id!, fileName)
          )
        )
      : of(null);

    deleteObs
      .pipe(
        concatMap(() =>
          this.interventionService.getByAssessment(this.data.assessmentId)
        ),
        concatMap((existing: InterventionModel[]) => {
          const merged = existing.map(e => (e.id === iv.id ? updated : e));
          return this.interventionService.upsertInterventions(
            this.data.assessmentId,
            merged
          );
        }),
        concatMap(() => {
          const filesToUpload = this.getNewFilesToUpload();
          return filesToUpload.length
            ? this.interventionService.uploadAttachments(iv.id!, filesToUpload)
            : of(null);
        })
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
        },
      });
  }

  removeExistingAttachment(index: number): void {
    const pathToRemove = this.existingAttachments[index];
    this.attachmentsToDelete.push(this.getFileName(pathToRemove));
    this.existingAttachments = this.existingAttachments.filter(
      (_, i) => i !== index
    );
    this.form.markAsDirty();
  }

  private getFileName(path: string): string {
    return path?.split('/').pop() ?? '';
  }

  private getNewFilesToUpload(): File[] {
    const uploadInputValue = this.form.get('uploadInput')?.value as
      | (File | string)[]
      | null;
    if (!uploadInputValue?.length || typeof uploadInputValue[0] === 'string')
      return [];
    return uploadInputValue as File[];
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
