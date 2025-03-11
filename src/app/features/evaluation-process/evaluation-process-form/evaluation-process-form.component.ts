import { DatePipe, NgIf } from '@angular/common';
import { Component, HostListener, Inject, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CosmicLatteService } from '../../../core/services/cosmic-latte.service';
import { BehaviorSubject } from 'rxjs';
import { GENERAL_MESSAGES } from '../../../core/constants/messages';
import { MatIcon } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { PollName } from '../../../shared/models/cosmic-latte/PollName';
import { EvaluationProcessService } from '../../../core/services/evaluation-process.service';
import { CreateEvaluationProcess } from '../../../shared/models/EvaluationProcess';
import { ModalComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-evaluation-process-form',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
  ],
  templateUrl: './evaluation-process-form.component.html',
  providers: [provideNativeDateAdapter(), DatePipe],
  styleUrl: './evaluation-process-form.component.scss',
})
export class EvaluationProcessFormComponent {
  form: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      evaluation?: any;
      title?: string;
      buttonText?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deleteFunction?: any;
    },
    private dialogRef: MatDialogRef<EvaluationProcessFormComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      Name: [
        data?.evaluation?.Name ?? '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(280),
        ],
      ],
      PollId: [data?.evaluation?.PollId ?? ''],
      StartDate: data?.evaluation?.StartDate ?? '',
      EndDate: data?.evaluation?.EndDate ?? '',
    });
    if (data) {
      this.title = this.data.title ?? 'New evaluation process';
      this.buttonText = this.data.buttonText ?? 'Create';

      if (data.evaluation != null) {
        this.pollDataSelected = {
          parent: data.evaluation.EvaluationPollId ?? '',
          name: data.evaluation.Name ?? '',
          status: data.evaluation.status ?? '',
          selectData: data.evaluation.Name
            ? `${data.evaluation.Name} - Id: ${data.evaluation.PollId}`
            : '',
        };
      }
    }
    this.getPollDetails();
  }
  title;
  buttonText;
  isMobile = false;
  prefereToChooseLater: PollName = {
    parent: 'null',
    name: 'null',
    status: 'null',
  };
  pollsNames: PollName[] = [this.prefereToChooseLater];
  cosmicLatteService = inject(CosmicLatteService);
  evaluationProcessService = inject(EvaluationProcessService);
  loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.loadingSubject.asObservable();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pollDataSelected: any = null;

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
  closeAndResetDialog() {
    this.dialogRef.close();
    this.resetForm();
  }
  deleteEvaluation() {
    if (this.data.deleteFunction) {
      this.data.deleteFunction(this.data.evaluation.PollId);
    }
  }
  openDialog(descriptionMessage: string, isSuccess: boolean): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      width: '450px',
      height: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        isSuccess: isSuccess,
        title: isSuccess
          ? GENERAL_MESSAGES.SUCCESS_TITLE
          : GENERAL_MESSAGES.ERROR_TITLE,
        success: {
          details: descriptionMessage,
        },
        error: {
          title: GENERAL_MESSAGES.ERROR_TITLE,
          details: [descriptionMessage],
          message: descriptionMessage,
        },
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
  onSubmit() {
    if (this.form.valid) {
      const newProcess: CreateEvaluationProcess = {
        Name: this.form.value.Name,
        StartDate: this.form.value.StartDate,
        EndDate: this.form.value.EndDate,
        PollId: this.form.value.PollId,
      };
      this.evaluationProcessService.createEvalProc(newProcess).subscribe({
        next: (data: CreateEvaluationProcess) => {
          console.log('RESPUESTA DE CREACION DE PROCESO DE EVAL');
          console.log(data);
          this.closeAndResetDialog();
          this.openDialog('Sucess: Process created!', true);
        },
        error: err => {
          this.openDialog(
            'Error: An error occurred while trying to create the new evaluation process : ' +
              err.message,
            false
          );
        },
      });
    }
  }

  getPollDetails() {
    this.cosmicLatteService.getPollNames().subscribe({
      next: (data: PollName[]) => {
        this.pollsNames = [this.prefereToChooseLater, ...data];
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.openDialog(
          'Error: An error occurred while trying to get the survey names :' +
            err.message,
          false
        );
      },
    });
  }
}
