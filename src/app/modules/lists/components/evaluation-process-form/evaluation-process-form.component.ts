import { ConfigurationsService } from '@core/services/api/configurations.service';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
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
import { GENERAL_MESSAGES } from '@core/constants/messages';
import { MatIcon } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ModalComponent } from '../../../../shared/components/modal-dialog/modal-dialog.component';
import { CountrySelectComponent, Country } from '@wlucha/ng-country-select';
import { countries } from '@core/constants/countries';
import { CreateEvaluationModel } from '@core/models/evaluation-request.model';
import { EvaluationModel } from '@core/models/evaluation.model';
import { PollName } from '@core/models/poll-request.model';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import Keycloak from 'keycloak-js';
import { noWhitespaceValidator } from '../../../../shared/validators/no-whitespace.validator';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';

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
export class EvaluationProcessFormComponent implements OnInit {
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
  configurationsService = inject(ConfigurationsService);
  configurations: ConfigurationsModel[] = [];
  serviceProvidersService = inject(ServiceProvidersService);
  serviceProviders: ServiceProviderModel[] = [];
  loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.loadingSubject.asObservable();
  pollDataSelected: PollName | null = null;
  selectedConfiguration: ConfigurationsModel | null = null;
  userId = '';

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
    private fb: FormBuilder,
    private readonly keycloak: Keycloak
  ) {
    this.form = this.fb.group({
      name: [
        data?.evaluation?.name ?? '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          noWhitespaceValidator,
        ],
      ],
      configuration: [
        {
          value: '',
          disabled: !!data?.evaluation?.configurationId,
        },
        Validators.required,
      ],
      pollName: [
        {
          value: data?.evaluation?.pollName ?? '',
          disabled: !!data?.evaluation?.pollName,
        },
        [Validators.required, Validators.maxLength(50)],
      ],
      country: [
        {
          value: data?.evaluation?.country ?? '',
        },
        [Validators.maxLength(50)],
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
        this.selectedConfiguration =
          this.configurations.find(
            c => c.id === data.evaluation?.configurationId
          ) ?? null;
        const countryAlpha3 = this.data.evaluation?.country.toLowerCase();

        const fullCountry = countries.find(c => c.alpha3 === countryAlpha3);

        if (fullCountry) {
          this.form.get('country')?.setValue(fullCountry);
        }
      }
    }
  }

  async ngOnInit() {
    const profile = await this.keycloak.loadUserProfile();
    this.userId = profile.id || '';
    this.getConfigurations();
    this.getServiceProviders();
  }

  public onCountrySelected(country: Country): void {
    this.selectedCountry = country.alpha3;
  }

  onConfigurationChange(selectedConfiguration: ConfigurationsModel): void {
    this.selectedConfiguration = selectedConfiguration;
    this.getPollDetails(selectedConfiguration.id);
  }

  getServiceProviderName(
    configuration: ConfigurationsModel
  ): string | undefined {
    return this.serviceProviders.find(
      sp => sp.id === configuration.serviceProviderId
    )?.serviceProviderName;
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
      ...MODAL_DEFAULT_CONF,
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
          configurationId: this.selectedConfiguration?.id,
          country: this.selectedCountry,
        } as CreateEvaluationModel;
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

  getServiceProviders() {
    this.serviceProvidersService.getAllServiceProviders().subscribe({
      next: (data: ServiceProviderModel[]) => {
        this.serviceProviders = data;
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.openDialog(
          'Error: An error occurred while trying to get the service providers :' +
            err.message,
          false
        );
      },
    });
  }

  getConfigurations() {
    if (!this.data.evaluation) {
      this.configurationsService
        .getConfigurationsByUserId(this.userId)
        .subscribe({
          next: (data: ConfigurationsModel[]) => {
            this.configurations = data;
            this.loadingSubject.next(false);
            const configuration = this.configurations.find(
              c => c.id === this.data.evaluation?.configurationId
            );
            if (configuration) {
              this.selectedConfiguration = configuration;
              this.form.get('configuration')?.setValue(configuration);
              this.getPollDetails(configuration.id);
            }
          },
          error: err => {
            this.loadingSubject.next(false);
            this.openDialog(
              'Error: An error occurred while trying to get the configurations :' +
                err.message,
              false
            );
          },
        });
      return;
    }

    this.configurationsService.getAllConfigurations().subscribe({
      next: (data: ConfigurationsModel[]) => {
        this.configurations = data;
        this.loadingSubject.next(false);
        if (this.data.evaluation?.configurationId) {
          const configuration = this.configurations.find(
            c => c.id === this.data.evaluation?.configurationId
          );
          if (configuration) {
            this.selectedConfiguration = configuration;
            this.form.get('configuration')?.setValue(configuration);
            this.getPollDetails(configuration.id);
          }
        }
      },
      error: err => {
        this.loadingSubject.next(false);
        this.openDialog(
          'Error: An error occurred while trying to get the configurations :' +
            err.message,
          false
        );
      },
    });
  }

  getPollDetails(configurationId: number) {
    this.cosmicLatteService.getPollNames(configurationId).subscribe({
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
