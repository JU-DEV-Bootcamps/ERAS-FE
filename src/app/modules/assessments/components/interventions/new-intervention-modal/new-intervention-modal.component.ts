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
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import {
  InterventionMode,
  InterventionType,
} from '@core/models/assessement.model';
import {
  AddInterventionPayload,
  InterventionService,
} from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InterventionModel } from '@core/models/assessement.model';
import { map, of, concatMap, catchError, Observable } from 'rxjs';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
];
const ALLOWED_EXTENSIONS = '.pdf,.jpg,.png,.txt';
const MAX_FILES = 2;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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
  value: string;
  label: string;
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
  templateUrl: './new-intervention-modal.component.html',
  styleUrl: '../../../styles/assessments-modal-styles.scss',
})
export class NewInterventionModalComponent implements FormCreation, OnInit {
  private readonly interventionService = inject(InterventionService);
  private readonly toastService = inject(ToastNotificationService);

  private _prefillValues: Record<string, unknown> = {};
  existingAttachments: string[] = [];

  readonly isGroup = signal<boolean>(false);

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;

  attendance = signal<{ student: StudentLookup; attended: boolean }[]>([]);
  attendedStudentIds = signal<string[]>([]);

  selectedFiles: File[] = [];
  fileErrors: string[] = [];
  readonly allowedExtensions = ALLOWED_EXTENSIONS;
  readonly modeOptions = MODE_OPTIONS;

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

  get canAddMoreFiles(): boolean {
    return this.selectedFiles.length < MAX_FILES;
  }

  get isEditMode(): boolean {
    return !!this.data.intervention;
  }

  constructor(
    public dialogRef: MatDialogRef<NewInterventionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewInterventionDialogData
  ) {}

  ngOnInit(): void {
    this.isGroup.set(
      this.isEditMode
        ? this.data.intervention!.kind === InterventionType.Group
        : this.data.students.length > 1
    );
    this.buildAttendance();
    if (this.isEditMode) this.prefillForm();
    this.buildFormFields();
  }

  onToggleGroup(checked: boolean): void {
    this.isGroup.set(checked);
    this.attendedStudentIds.set([]);
    this.buildAttendance();
    this.buildFormFields();
  }

  private buildFormFields(): void {
    const professionalField: DynamicField = {
      type: 'select',
      name: 'professionalId',
      label: 'Professional',
      placeholder: this.data.professional.label,
      options: [this.data.professional],
      validators: [Validators.required],
      floatingLabel: 'always',
      value: this.data.professional.value,
      disabled: true,
    };

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
    ];

    const studentsGroupField: DynamicField = {
      type: 'select',
      name: 'students',
      label: 'Students',
      placeholder: 'Select students',
      options: this.data.students,
      validators: [Validators.required],
      multipleSelect: true,
      floatingLabel: 'always',
      value: this.data.students.map(s => s.value),
    };

    const studentsIndividualField: DynamicField = {
      type: 'select',
      name: 'students',
      label: 'Student',
      placeholder: 'Select student',
      options: this.data.students,
      validators: [Validators.required],
      floatingLabel: 'always',
      value: this.data.students[0]?.value,
    };

    const bottomFields: DynamicField[] = [
      {
        type: 'select',
        name: 'mode',
        label: 'Mode',
        placeholder: 'Select mode',
        options: MODE_OPTIONS,
        validators: [Validators.required],
        floatingLabel: 'always',
      },
      {
        type: 'textarea',
        name: 'comments',
        label: 'Comments',
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
      ? [professionalField, ...topFields, studentsGroupField, ...bottomFields]
      : [
          professionalField,
          ...topFields,
          studentsIndividualField,
          ...bottomFields,
        ];
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;
    if (this.isEditMode && Object.keys(this._prefillValues).length) {
      this.form.patchValue(this._prefillValues);
      this.form.markAsPristine();
    }
  }

  private prefillForm(): void {
    const iv = this.data.intervention!;
    this._prefillValues = {
      date: iv.dateUtc,
      activity: iv.activity,
      area: iv.area,
      mode: iv.mode,
      comments: iv.comments,
      students: this.isGroup()
        ? iv.studentIds.map(String)
        : String(iv.studentIds[0]),
    };

    const attended = Object.entries(iv.attendance ?? {})
      .filter(([, v]) => v)
      .map(([k]) => k);
    this.attendedStudentIds.set(attended);
    this.attendance.set(
      this.data.students.map(s => ({
        student: s,
        attended: attended.includes(s.value),
      }))
    );

    this.existingAttachments = iv.attachments ?? [];
  }

  private buildAttendance(): void {
    this.attendance.set(
      this.data.students.map(student => ({ student, attended: false }))
    );
  }

  onAttendanceChange(selectedValues: string[]): void {
    if (!this.isGroup()) {
      const single = selectedValues.slice(-1);
      this.attendedStudentIds.set(single);
    } else {
      this.attendedStudentIds.set(selectedValues);
    }

    const current = this.attendance().map(item => ({
      ...item,
      attended: this.attendedStudentIds().includes(item.student.value),
    }));
    this.attendance.set(current);
  }

  toggleAttendance(index: number, checked: boolean): void {
    const current = [...this.attendance()];
    current[index] = { ...current[index], attended: checked };
    this.attendance.set(current);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.fileErrors = [];

    for (const file of Array.from(input.files)) {
      if (this.selectedFiles.length >= MAX_FILES) {
        this.fileErrors.push(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      if (
        this.selectedFiles.some(
          f => f.name === file.name && f.size === file.size
        )
      ) {
        this.fileErrors.push(`"${file.name}" has already been added.`);
        continue;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        this.fileErrors.push(
          `"${file.name}" has an unsupported format. Allowed: ${ALLOWED_EXTENSIONS}`
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        this.fileErrors.push(`"${file.name}" exceeds the 10MB size limit.`);
        continue;
      }
      this.selectedFiles.push(file);
    }

    input.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.fileErrors = [];
  }

  submitIntervention(): void {
    if (this.form.invalid) return;

    if (this.isEditMode) {
      this.updateIntervention();
      return;
    }

    const payload = this.buildPayload();

    this.interventionService
      .createIntervention(payload)
      .pipe(
        concatMap((created: InterventionModel) => {
          if (this.selectedFiles.length === 0) return of(created);
          return this.interventionService
            .uploadAttachments(created.id!, this.selectedFiles)
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
          console.error(err);
        },
        complete: () => {
          this.dialogRef.close(true);
        },
      });
  }

  private buildPayload(): AddInterventionPayload {
    const v = this.form.value;
    const isGroup = this.isGroup();

    const studentIds: number[] = isGroup
      ? (v.students as string[]).map(Number)
      : [Number(v.students)];

    const attendanceRecord: Record<number, boolean> = {};
    this.attendance().forEach(({ student, attended }) => {
      attendanceRecord[Number(student.value)] = attended;
    });

    return {
      assessmentId: this.data.assessmentId,
      intervention: {
        kind: isGroup ? InterventionType.Group : InterventionType.Individual,
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

    this.interventionService
      .getByAssessment(this.data.assessmentId)
      .pipe(
        concatMap(existing => {
          const merged = existing.map(e => (e.id === iv.id ? updated : e));
          return this.interventionService.upsertInterventions(
            this.data.assessmentId,
            merged
          );
        }),
        concatMap(() => {
          if (!this.selectedFiles.length) return of(null);
          return this.interventionService.uploadAttachments(
            iv.id!,
            this.selectedFiles
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

  private uploadFiles(interventionId: number): Observable<unknown> {
    if (!this.selectedFiles.length) return of(null);
    return this.interventionService
      .uploadAttachments(interventionId, this.selectedFiles)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.toastService.showToast(
              {
                title: 'Duplicate file',
                message:
                  err.error?.title ?? 'This file has already been uploaded.',
                type: 'error',
              },
              true
            );
          }
          return of(null);
        })
      );
  }

  removeExistingAttachment(index: number): void {
    const pathToRemove = this.existingAttachments[index];
    const fileName = this.getFileName(pathToRemove);
    const interventionId = this.data.intervention!.id!;

    this.interventionService
      .deleteAttachment(interventionId, fileName)
      .subscribe({
        next: () => {
          this.existingAttachments = this.existingAttachments.filter(
            (_, i) => i !== index
          );
          this.form.markAsDirty();
        },
        error: (err: HttpErrorResponse) => {
          this.toastService.showToast(
            {
              title: 'Delete Failed',
              message: `Could not delete attachment: ${err.error?.title ?? err.statusText}`,
              type: 'error',
            },
            true
          );
        },
      });
  }

  getFileName(path: string): string {
    return path.split('/').pop() ?? path;
  }
}
