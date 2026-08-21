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
import { InterventionType } from '@core/models/assessment.model';
import {
  AddInterventionPayload,
  InterventionService,
} from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InterventionModel } from '@core/models/assessment.model';
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

export interface NewInterventionDialogData {
  assessmentId: number;
  professional: { value: string; label: string };
  students: StudentLookup[];
  intervention?: InterventionModel;
}

@Component({
  selector: 'app-edit-intervention-modal',
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

  private _prefillValues: Record<string, unknown> = {};
  existingAttachments: string[] = [];
  attachmentsToDelete: string[] = [];
  attendedStudentIdsModel: string[] = [];

  isGroup = signal<boolean>(false);
  studentsSelected = signal<number[]>([]);

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;

  private pendingIndividualStudentId?: number;

  attendance = signal<{ student: StudentLookup; attended: boolean }[]>([]);
  attendedStudentIds = signal<string[]>([]);

  readonly numberOfParticipants = computed(() => this.data.students.length);

  get isSubmitDisabled(): boolean {
    return !this.form || this.form.invalid || this.form.pristine;
  }

  constructor(
    public dialogRef: MatDialogRef<EditInterventionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewInterventionDialogData
  ) {}

  ngOnInit(): void {
    this.isGroup.set(this.data.intervention!.kind === InterventionType.Group);
    this.prefillForm();
    this.buildFormFields();
  }

  private buildFormFields(preselectedStudentId?: number): void {
    const isGroupForm = this.data.students.length > 1;
    const typeValueDefault = isGroupForm
      ? InterventionType.Group
      : InterventionType.Individual;

    const individualDefaultId =
      preselectedStudentId ?? this.data.intervention!.studentIds[0];

    const defaultStudentIds = this.isGroup()
      ? this.data.intervention!.studentIds
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
      },
      {
        type: 'select',
        name: 'type',
        label: 'Intervention Type',
        placeholder: 'Select intervention',
        options: TYPE_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.isGroup() ? typeValueDefault : InterventionType.Individual,
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
      value: this.data.intervention!.studentIds,
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
        name: 'status',
        label: 'Status',
        options: STATUS_OPTIONS.filter(s =>
          s.allowed.includes(this.data.intervention!.status ?? '')
        ),
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: {
          displayMode: 'chips',
        },
        value: this.data.intervention!.status,
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
          prefillFileNames: (this.data.intervention!.attachments ?? []).map(p =>
            this.getFileName(p)
          ),
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

  private applyIndividualSwitch(remainingStudentId?: number): void {
    if (!this.isGroup()) return;

    this.isGroup.set(false);
    this.attendedStudentIds.set([]);
    this.attendedStudentIdsModel = [];
    this.buildAttendance();
    this.buildFormFields(remainingStudentId);

    this.form.get('type')?.setValue(InterventionType.Individual, {
      emitEvent: false,
    });

    if (remainingStudentId !== undefined) {
      setTimeout(() => {
        this.form.get('students')?.setValue(remainingStudentId, {
          emitEvent: false,
        });
        this.form.markAsDirty();
      });
    }
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;
    this.form.patchValue(this._prefillValues);

    const liveType = this.isGroup()
      ? InterventionType.Group
      : InterventionType.Individual;
    this.form.get('type')?.setValue(liveType, { emitEvent: false });

    if (this.pendingIndividualStudentId !== undefined) {
      this.form.get('students')?.setValue(this.pendingIndividualStudentId, {
        emitEvent: false,
      });
      this.form.markAsDirty();
      this.pendingIndividualStudentId = undefined;
    }

    this.form
      .get('type')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        const nowGroup = value === InterventionType.Group;
        if (nowGroup === this.isGroup()) return;

        if (nowGroup) {
          this.isGroup.set(true);
          this.attendedStudentIds.set([]);
          this.attendedStudentIdsModel = [];
          this.buildAttendance();
          this.buildFormFields();
        } else {
          this.applyIndividualSwitch();
        }
      });

    this.form
      .get('students')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (!this.isGroup()) return;

        const selected: number[] = Array.isArray(value)
          ? (value as number[])
          : value !== null && value !== undefined
            ? [value as number]
            : [];

        if (selected.length < 2) {
          this.applyIndividualSwitch(selected[0]);
        }
      });

    this.form
      .get('status')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        const isFinalized = value === 'Finalized';
        const control = this.form.get('riskLevelName');

        if (isFinalized) {
          control?.disable();
          this.addEndRiskLevelField();
        } else {
          control?.enable();
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
      uploadInput: (iv.attachments ?? []).map(p => this.getFileName(p)),
      riskLevelName: iv.riskLevelName,
      status: iv.status,
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

    const current = this.attendance().map(item => ({
      ...item,
      attended: asArray.includes(String(item.student.value)),
    }));
    this.attendance.set(current);
    this.form.markAsDirty();
  }

  submitIntervention(): void {
    if (this.form.invalid) return;

    const selectedStudents: string[] = this.isGroup()
      ? (this.form.value.students as string[]).map(String)
      : [String(this.form.value.students)];

    const attendedIds: string[] = Array.isArray(this.attendedStudentIds())
      ? this.attendedStudentIds()
      : [this.attendedStudentIds() as unknown as string];

    const invalidAttendees = attendedIds.filter(
      id => !selectedStudents.includes(String(id))
    );

    if (invalidAttendees.length > 0) {
      this.toastService.showToast(
        {
          title: 'Invalid attendance',
          message:
            'Attendance can only include students selected for this intervention.',
          type: 'error',
        },
        true
      );
      return;
    }

    this.updateIntervention();
    return;
  }

  private buildPayload(): AddInterventionPayload {
    const v = this.form.value;

    const isGroup = this.isGroup();

    const studentIds: number[] = isGroup
      ? (v.students as string[]).map(Number)
      : [Number(v.students)];

    const attendanceRecord: Record<number, boolean> = {};
    this.data.students.forEach(student => {
      attendanceRecord[Number(student.value)] =
        this.attendedStudentIds().includes(String(student.value));
    });

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
        attendance: attendanceRecord,
        attachments: [],
        riskLevelName: v.riskLevelName,
        status: v.status,
        endRiskLevelName: v.endRiskLevelName,
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
          if (!filesToUpload.length) return of(null);
          return this.interventionService.uploadAttachments(
            iv.id!,
            filesToUpload
          );
        })
      )
      .subscribe({
        next: () => {
          this.toastService.showToast({
            title: 'Intervention updated successfully',
            message: 'The intervention has been updated.',
            type: 'success',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.toastService.showToast(
            {
              title: 'Update Failed',
              message: `${err.statusText}: ${err.error?.title ?? 'There was an error updating the intervention.'}`,
              type: 'error',
            },
            true
          );
        },
        complete: () => this.dialogRef.close(true),
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
    if (path === undefined) return '';
    return path.split('/').pop() ?? path;
  }

  private getNewFilesToUpload(): File[] {
    const uploadInputValue = this.form.get('uploadInput')?.value as
      | File[]
      | string[];
    if (!uploadInputValue?.length) return [];

    const existingNames = new Set(
      this.existingAttachments.map(path => this.getFileName(path))
    );

    if (typeof uploadInputValue[0] === 'string') {
      (uploadInputValue as string[]).filter(
        filename => !existingNames.has(filename)
      );
      return [];
    }
    return (uploadInputValue as File[]).filter(
      file => !existingNames.has(file.name)
    );
  }

  private addEndRiskLevelField(): void {
    if (this.form.contains('endRiskLevelName')) return;

    this.form.addControl(
      'endRiskLevelName',
      new FormControl(
        {
          value: this.data.intervention?.endRiskLevelName ?? '',
          disabled: false,
        },
        [Validators.required]
      )
    );

    if (!this.formFields.some(f => f.name === 'endRiskLevelName')) {
      this.formFields = [
        ...this.formFields,
        {
          type: 'select',
          name: 'endRiskLevelName',
          label: 'End Risk Level',
          validators: [Validators.required],
          options: RISK_OPTIONS,
          floatingLabel: 'always',
          selectConfig: { displayMode: 'chips' },
        },
      ];
    }
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
