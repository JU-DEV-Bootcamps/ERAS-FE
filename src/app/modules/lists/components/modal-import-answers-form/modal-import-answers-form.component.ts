import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { PollName } from '@core/models/poll-request.model';
import { isEmpty } from '@core/utils/helpers/is-empty';
import { IMPORT_MESSAGES } from '@core/constants/messages';
import { DialogService } from '@core/services/dialog.service';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NewConfigurationModalComponent } from '@shared/components/modals/new-configuration-modal/new-configuration-modal.component';
import { PreselectedPoll } from '@modules/imports/models/preselected-poll';

@Component({
  selector: 'app-modal-import-answers-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter(), DatePipe],
  templateUrl: './modal-import-answers-form.component.html',
  styleUrl: './modal-import-answers-form.component.scss',
})
export class ModalImportAnswersFormComponent implements OnInit {
  form: FormGroup;
  private fb: FormBuilder = inject(FormBuilder);
  private configurationsService: ConfigurationsService = inject(
    ConfigurationsService
  );
  private serviceProvidersService: ServiceProvidersService = inject(
    ServiceProvidersService
  );
  private datePipe: DatePipe = inject(DatePipe);
  private readonly userData: UserDataService = inject(UserDataService);
  private preselectedPollState: PreselectedPoll = inject(MAT_DIALOG_DATA);
  private dialogService: DialogService = inject(DialogService);
  private cosmicLatteService: CosmicLatteService = inject(CosmicLatteService);
  private dialogRef: MatDialogRef<NewConfigurationModalComponent> = inject(
    MatDialogRef<NewConfigurationModalComponent>
  );

  pollsNames: PollName[] = [];
  userConfigurations: ConfigurationsModel[] = [];
  serviceProviders: ServiceProviderModel[] = [];
  loadingSubject = new BehaviorSubject<boolean>(true);
  selectedConfiguration: ConfigurationsModel | null = null;

  constructor() {
    this.form = this.fb.group({
      configuration: new FormControl({ value: '', disabled: true }),
      pollName: new FormControl(
        {
          value: this.preselectedPollState?.pollName ?? '',
          disabled: true,
        },
        [Validators.pattern(/^(?!\s*$).+/)]
      ),
      start: this.preselectedPollState?.startDate ?? '',
      end: this.preselectedPollState?.endDate ?? '',
    });
  }

  ngOnInit() {
    const profile = this.userData.user()!;

    this.getUserConfigurations(profile.id || '');
    this.getServiceProviders();
  }

  getServiceProviders() {
    this.serviceProvidersService.getAllServiceProviders().subscribe({
      next: data => {
        this.serviceProviders = data;
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.dialogService.openDialog(
          IMPORT_MESSAGES.ANSWERS_ERROR,
          'error',
          err.message
        );
        this.resetForm();
      },
    });
  }

  getServiceProviderName(
    configuration: ConfigurationsModel
  ): string | undefined {
    return this.serviceProviders.find(
      sp => sp.id === configuration.serviceProviderId
    )?.serviceProviderName;
  }

  getUserConfigurations(userId: string) {
    this.configurationsService.getConfigurationsByUserId(userId).subscribe({
      next: data => {
        this.userConfigurations = data;
        if (!isEmpty(this.userConfigurations)) {
          this.selectedConfiguration = this.userConfigurations[0];
          this.form.get('configuration')?.setValue(this.selectedConfiguration);
          this.getPollDetails(this.selectedConfiguration.id);
          this._fillUpState(this.selectedConfiguration);
          this._fillPollsForm();
        }
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.dialogService.openDialog(
          IMPORT_MESSAGES.ANSWERS_ERROR,
          'error',
          err.message
        );
        this.resetForm();
      },
    });
  }

  private _fillUpState(configuration: ConfigurationsModel) {
    const state = history.state as {
      pollName?: string;
      endDate?: string;
      startDate?: string;
    };
    if (state?.pollName) {
      this.preselectedPollState = {
        ...this.preselectedPollState,
        configuration: configuration,
        pollName: state.pollName,
        startDate: state.startDate!,
        endDate: state.endDate!,
      };
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const rawValue = this.form.getRawValue();
    const pollName = rawValue.pollName.trim();
    const startDate = rawValue.start
      ? this.formatDate(new Date(rawValue.start))
      : null;
    const endDate = rawValue.end
      ? this.formatDate(new Date(rawValue.end))
      : null;
    const data = {
      configuration: this.selectedConfiguration,
      pollName: pollName,
      endDate: endDate,
      startDate: startDate,
    };

    this.dialogRef.close(data);
  }

  formatDate(date: Date): string {
    if (isNaN(date.getTime())) {
      return '';
    }
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  resetForm() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private _fillPollsForm() {
    this.form.get('configuration')?.setValue(this.selectedConfiguration);
    this.form.get('pollName')?.setValue(this.preselectedPollState?.pollName);
    this.form.get('start')?.setValue(this.preselectedPollState?.startDate);
    this.form.get('end')?.setValue(this.preselectedPollState?.endDate ?? '');
  }

  getPollDetails(configurationId: number) {
    this.cosmicLatteService.getPollNames(configurationId).subscribe({
      next: data => {
        this.pollsNames = data;
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.dialogService.openDialog(
          IMPORT_MESSAGES.ANSWERS_ERROR,
          'error',
          err.message
        );
      },
    });
  }

  onConfigurationChange(selectedConfiguration: ConfigurationsModel): void {
    this.selectedConfiguration = selectedConfiguration;
    this.getPollDetails(selectedConfiguration.id);
  }
}
