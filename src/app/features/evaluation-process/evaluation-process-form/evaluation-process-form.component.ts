import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
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
import { ModalComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { CountrySelectComponent, Country } from '@wlucha/ng-country-select';
import { countries } from '../../../core/constants/countries';
import { CreateEvaluationModel } from '../../../core/models/evaluation-request.model';
import { EvaluationModel } from '../../../core/models/evaluation.model';
import { PollName } from '../../../core/models/poll-request.model';
import { CosmicLatteService } from '../../../core/services/api/cosmic-latte.service';
import { EvaluationsService } from '../../../core/services/api/evaluations.service';

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
    NgClass,
    CountrySelectComponent,
  ],
  templateUrl: './evaluation-process-form.component.html',
  providers: [provideNativeDateAdapter(), DatePipe],
  styleUrl: './evaluation-process-form.component.scss',
})
export class EvaluationProcessFormComponent {
  form: FormGroup;
  title;
  buttonText;
  selectedCountry = '';
  prefereToChooseLater: PollName = {
    parent: 'null',
    name: 'null',
    status: 'null',
    selectData: 'null',
    country: 'null',
  };
  pollsNames: PollName[] = [this.prefereToChooseLater];
  cosmicLatteService = inject(CosmicLatteService);
  evaluationsService = inject(EvaluationsService);
  loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.loadingSubject.asObservable();
  pollDataSelected: PollName | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      evaluation?: EvaluationModel;
      title?: string;
      buttonText?: string;
      deleteFunction?: (id: number) => void;
      updateFunction?: () => void;
    },
    private dialogRef: MatDialogRef<EvaluationProcessFormComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: [
        data?.evaluation?.name ?? '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(280),
        ],
      ],
      pollName: [
        {
          value: data?.evaluation?.pollName ?? '',
          disabled: !!data?.evaluation?.pollName,
        },
        Validators.required,
      ],
      country: [
        {
          value: data?.evaluation?.country ?? '',
        },
      ],
      startDate: [data?.evaluation?.startDate ?? '', Validators.required],
      endDate: [data?.evaluation?.endDate ?? '', Validators.required],
    });

    if (data) {
      this.title = this.data.title ?? 'New evaluation process';
      this.buttonText = this.data.buttonText ?? 'Create';
      if (data.evaluation != null) {
        this.pollDataSelected = {
          parent: data.evaluation.evaluationPollId.toString() ?? '',
          name: data.evaluation.name ?? '',
          status: data.evaluation.status ?? '',
          selectData: data.evaluation.pollName
            ? `${data.evaluation.pollName}`
            : '',
          country: data.evaluation.country,
        };
        const countryAlpha3 = this.data.evaluation?.country.toLowerCase();

        const fullCountry = countries.find(c => c.alpha3 === countryAlpha3);

        if (fullCountry) {
          this.form.get('country')?.setValue(fullCountry);
        }
      }
    }

    this.getPollDetails();
  }

  public onCountrySelected(country: Country): void {
    this.selectedCountry = country.alpha3;
  }

  closeAndResetDialog() {
    this.dialogRef.close();
    this.resetForm();
  }
  deleteEvaluation() {
    if (this.data.deleteFunction) {
      this.data.deleteFunction(this.data.evaluation!.id!);
      this.closeAndResetDialog();
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
      if (!this.data.evaluation) {
        const newProcess: CreateEvaluationModel = {
          name: this.form.value.name,
          startDate: this.form.value.startDate,
          endDate: this.form.value.endDate,
          pollName: this.form.value.pollName,
          country: this.selectedCountry,
        };
        if (this.form.value.pollName === 'null') {
          delete newProcess.pollName;
        }
        this.evaluationsService.createEvalProc(newProcess).subscribe({
          next: () => {
            this.closeAndResetDialog();
            this.openDialog('Sucess: Process created!', true);
            if (this.data.updateFunction) {
              this.data.updateFunction();
            } else {
              console.warn('No update function provided');
            }
          },
          error: err => {
            this.openDialog(
              'Error: An error occurred while trying to create the new evaluation process : ' +
                err.message,
              false
            );
          },
        });
      } else {
        const updateEval: EvaluationModel = {
          id: this.data.evaluation.id,
          name: this.form.value.name,
          startDate: this.form.value.startDate,
          endDate: this.form.value.endDate,
          ...(this.form.value.pollName !== 'null'
            ? {
                pollName: this.form.value.pollName,
              }
            : {}),
          country: this.selectedCountry,
        } as EvaluationModel;

        this.evaluationsService.updateEvaluationProcess(updateEval).subscribe({
          next: () => {
            this.closeAndResetDialog();
            this.openDialog('Sucess: Process updated!', true);
            if (this.data.updateFunction) {
              this.data.updateFunction();
            } else {
              console.warn('No update function provided');
            }
          },
          error: err => {
            this.openDialog(
              'Error: An error occurred while trying to update the new evaluation process : ' +
                err.message,
              false
            );
          },
        });
      }
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
