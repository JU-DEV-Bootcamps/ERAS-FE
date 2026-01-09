import { Component, Inject, inject, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { CountrySelectComponent, Country } from '@wlucha/ng-country-select';

import { ConfigurationsModel } from '@core/models/configurations.model';
import { countries } from '@core/constants/countries';
import { CreateEvaluationModel } from '@core/models/evaluation-request.model';
import { EvaluationModel } from '@core/models/evaluation.model';
import { PollName } from '@core/models/poll-request.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';

import { isEmpty } from '@core/utils/helpers/is-empty';
import { noWhitespaceValidator } from '@core/utils/validators/no-whitespace.validator';

import { ConfigurationsService } from '@core/services/api/configurations.service';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { NotifyService } from '@core/services/notify.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { UserDataService } from '@core/services/access/user-data.service';

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
  serviceProvidersService = inject(ServiceProvidersService);
  private readonly notify = inject(NotifyService);

  configurations: ConfigurationsModel[] = [];
  serviceProviders: ServiceProviderModel[] = [];
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
    private fb: FormBuilder,
    private readonly userData: UserDataService
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
    const profile = this.userData.user()!;
    this.userId = (profile && profile.id) || '';
    this.getConfigurations();
    this.getServiceProviders();
  }

  public onCountrySelected(country: Country): void {
    this.selectedCountry = country.alpha3;
    this.form.markAsDirty();
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
          pollName: this.form.value.pollName.name,
          configurationId: this.selectedConfiguration?.id,
          country: this.selectedCountry || this.form.value.country.alpha3,
        } as CreateEvaluationModel;
        if (this.form.value.pollName.name === 'null') {
          delete newProcess.pollName;
        }
        this.evaluationsService
          .createEvalProc(newProcess, this.form.value.pollName._id)
          .subscribe({
            next: () => {
              this.closeAndResetDialog();
              this.notify.success('Sucess: Process created!');
              if (this.data.updateFunction) {
                this.data.updateFunction();
              } else {
                console.warn('No update function provided');
              }
            },
            error: ({ error }) => {
              this.notify.error(error);
            },
          });
      } else {
        const updateEval: EvaluationModel = {
          id: this.data.evaluation.id,
          name: this.form.value.name,
          startDate: this.form.value.startDate,
          endDate: this.form.value.endDate,
          ...(!isEmpty(this.form.value.pollName.name)
            ? {
                pollName: this.form.value.pollName.name,
              }
            : {}),
          country: this.selectedCountry || this.form.value.country.alpha3,
        } as EvaluationModel;

        this.evaluationsService.updateEvaluationProcess(updateEval).subscribe({
          next: () => {
            this.closeAndResetDialog();
            this.notify.success('Sucess: Process updated!');
            if (this.data.updateFunction) {
              this.data.updateFunction();
            } else {
              console.warn('No update function provided');
            }
          },
          error: ({ error }) => {
            this.notify.error(error);
          },
        });
      }
    }
    this.form.reset();
  }

  getServiceProviders() {
    this.serviceProvidersService.getAllServiceProviders().subscribe({
      next: (data: ServiceProviderModel[]) => {
        this.serviceProviders = data;
      },
      error: err => {
        this.notify.error(
          'Error: An error occurred while trying to get the service providers :' +
            err.message
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
            this.notify.error(
              'Error: An error occurred while trying to get the configurations :' +
                err.message
            );
          },
        });
      return;
    }

    this.configurationsService.getAllConfigurations().subscribe({
      next: (data: ConfigurationsModel[]) => {
        this.configurations = data;
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
        this.notify.error(
          'Error: An error occurred while trying to get the configurations :' +
            err.message
        );
      },
    });
  }

  getPollDetails(configurationId: number) {
    this.cosmicLatteService.getPollNames(configurationId).subscribe({
      next: (data: PollName[]) => {
        this.pollsNames = [this.prefereToChooseLater, ...data];
      },
      error: err => {
        this.notify.error(
          'Error: An error occurred while trying to get the survey names :' +
            err.message
        );
      },
    });
  }
}
