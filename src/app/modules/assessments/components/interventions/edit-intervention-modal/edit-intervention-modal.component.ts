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
  InterventionMode,
  InterventionType,
} from '@core/models/assessment.model';
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

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
];
const ALLOWED_EXTENSIONS = '.pdf,.jpg,.png,.txt';
const MAX_FILES = 2;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Group', label: 'Group' },
];

const RISK_OPTIONS = [
  { value: 'Low', label: 'Low', color: 'success' },
  { value: 'Medium', label: 'Medium', color: 'warning' },
  { value: 'High', label: 'High', color: 'danger' },
];

const STATUS_OPTIONS = [
  {
    value: 'Remitted',
    label: 'Remitted',
    allowed: ['Remitted'],
    colors: {
      label: '#333399',
      background: '#cdcde1',
    },
  },
  {
    value: 'InProgress',
    label: 'InProgress',
    allowed: ['Remitted', 'InProgress'],
    colors: {
      label: '#854d0e',
      background: '#fef9c3',
    },
  },
  {
    value: 'Finalized',
    label: 'Finalized',
    allowed: ['InProgress'],
    colors: {
      label: '#117473',
      background: '#afeae9',
    },
  },
];

const ACTIVITY_OPTIONS = [
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'mentoring', label: 'Mentoring' },
];

const AREA_OPTIONS = [
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'vocational', label: 'Vocational' },
];

const MODE_OPTIONS = [
  { value: InterventionMode.InPlace, label: 'In place' },
  { value: InterventionMode.Remote, label: 'Remote' },
];

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

  attendance = signal<{ student: StudentLookup; attended: boolean }[]>([]);
  attendedStudentIds = signal<string[]>([]);

  readonly numberOfParticipants = computed(() => this.data.students.length);

  readonly selectedStudentCount = computed(() => {
    if (!this.isGroup()) return 1;
    if (!this.form || !this.form.get('students'))
      return this.data.students.length;
    const selected = (this.form.get('students')?.value as string[]) ?? [];
    return selected.length || this.data.students.length;
  });

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

  private buildFormFields(): void {
    const isGroupForm = this.data.students.length > 1;
    const typeValueDefault = isGroupForm
      ? InterventionType.Group
      : InterventionType.Individual;

    const defaultStudentIds = this.isGroup()
      ? this.data.intervention!.studentIds
      : [this.data.intervention!.studentIds[0]];
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
        value: typeValueDefault,
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
      value: this.data.intervention!.studentIds[0],
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

  setFormGroup(event: FormGroup): void {
    this.form = event;
    this.form.patchValue(this._prefillValues);

    this.form
      .get('type')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        const nowGroup = value === InterventionType.Group;
        if (nowGroup === this.isGroup()) return;
        this.isGroup.set(nowGroup);
        this.attendedStudentIds.set([]);
        this.attendedStudentIdsModel = [];
        this.buildAttendance();
        this.buildFormFields();
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
      },
    };
  }

  closeAndResetDialog(): void {
    this.dialogRef.close();
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

  getFileName(path: string): string {
    if (path === undefined) return '';
    return path.split('/').pop() ?? path;
  }

  private getNewFilesToUpload(): File[] {
    const uploadInputValue = this.form.get('uploadInput')?.value as File[];
    if (!uploadInputValue?.length) return [];

    const existingNames = new Set(
      this.existingAttachments.map(path => this.getFileName(path))
    );
    return uploadInputValue.filter(file => !existingNames.has(file.name));
  }
}
