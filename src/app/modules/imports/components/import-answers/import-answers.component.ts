import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { provideNativeDateAdapter } from '@angular/material/core';

import { ConfigurationsModel } from '@core/models/configurations.model';
import {
  DialogData,
  DialogType,
} from '@shared/components/modals/modal-dialog/types/dialog';
import { PollInstance } from '@core/models/poll-instance.model';
import { PollName } from '@core/models/poll-request.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';

import { IMPORT_MESSAGES, TYPE_TITLE } from '@core/constants/messages';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';

import { isEmpty } from '@core/utils/helpers/is-empty';

import { ConfigurationsService } from '@core/services/api/configurations.service';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { UserDataService } from '@core/services/access/user-data.service';

import { ImportAnswersPreviewComponent } from './import-answers-preview/import-answers-preview.component';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';

interface PreselectedPoll {
  configuration: ConfigurationsModel;
  surveyName: string;
  start: string;
  end: string;
}

@Component({
  selector: 'app-import-answers',
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSelectModule,
    FormsModule,
    NgIf,
    AsyncPipe,
    ImportAnswersPreviewComponent,
  ],
  templateUrl: './import-answers.component.html',
  styleUrl: './import-answers.component.scss',
  providers: [provideNativeDateAdapter(), DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAnswersComponent implements OnInit {
  form: FormGroup;

  loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.loadingSubject.asObservable();

  pollsNames: PollName[] = [];
  userConfigurations: ConfigurationsModel[] = [];
  selectedConfiguration: ConfigurationsModel | null = null;
  serviceProviders: ServiceProviderModel[] = [];
  importedPollData: PollInstance[] = [];
  columns = ['#', 'name', 'email', 'cohort', 'actions'];
  students = [];
  preselectedPollState: PreselectedPoll | null = null;

  isMobile = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cosmicLatteService: CosmicLatteService,
    private configurationsService: ConfigurationsService,
    private serviceProvidersService: ServiceProvidersService,
    private readonly userData: UserDataService,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      configuration: '',
      surveyName: [
        this.preselectedPollState?.surveyName ?? '',
        [Validators.pattern(/^(?!\s*$).+/)],
      ],
      start: this.preselectedPollState?.start ?? '',
      end: this.preselectedPollState?.end ?? '',
    });
  }

  ngOnInit() {
    const profile = this.userData.user()!;
    this.getUserConfigurations(profile.id || '');
    this.checkScreenSize();
    this.getServiceProviders();
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  private openDialog(
    descriptionMessage: string,
    type: DialogType,
    extraMessage?: string
  ): void {
    const buttonElement = document.activeElement as HTMLElement;
    const dialogData: DialogData = {
      type,
      title: TYPE_TITLE[type],
      message: extraMessage,
      details: [descriptionMessage],
    };
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: dialogData,
    });
  }
  onSubmit() {
    if (this.form.invalid) return;
    const name = this.form.value.surveyName.trim();
    const startDate = this.form.value.start
      ? this.formatDate(new Date(this.form.value.start))
      : null;
    const endDate = this.form.value.end
      ? this.formatDate(new Date(this.form.value.end))
      : null;

    this.loadingSubject.next(true);
    this.cosmicLatteService
      .importAnswerBySurvey(
        this.selectedConfiguration!.id,
        name,
        startDate,
        endDate
      )
      .subscribe({
        next: (data: PollInstance[]) => {
          this.importedPollData = data;
          this.loadingSubject.next(false);
          this.resetForm();
          if (data.length < 1) {
            this.openDialog(IMPORT_MESSAGES.ANSWERS_PREVIEW_EMPTY, 'success');
          } else {
            this.openDialog(IMPORT_MESSAGES.ANSWERS_PREVIEW_OK, 'success');
          }
        },
        error: err => {
          this.loadingSubject.next(false);
          this.openDialog(
            IMPORT_MESSAGES.ANSWERS_ERROR,
            'error',
            err?.error?.message
          );
          this.resetForm();
        },
      });
  }

  handleSavePollState(event: { state: string }) {
    if (event.state == 'pending') {
      this.loadingSubject.next(true);
    } else if (event.state == 'true') {
      this.loadingSubject.next(false);
      this.importedPollData = [];
      this.resetForm();
      this.openDialog('Polls saved successfully!', 'success');
    } else {
      this.loadingSubject.next(false);
      this.openDialog('Error saving polls. Please try again.', 'error');
    }
  }
  getPollDetails(configurationId: number) {
    this.cosmicLatteService.getPollNames(configurationId).subscribe({
      next: data => {
        this.pollsNames = data;
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.openDialog(IMPORT_MESSAGES.ANSWERS_ERROR, 'error', err.message);
        this.resetForm();
      },
    });
  }
  getUserConfigurations(userId: string) {
    this.configurationsService.getConfigurationsByUserId(userId).subscribe({
      next: data => {
        this.userConfigurations = data;
        if (!isEmpty(this.userConfigurations)) {
          this.selectedConfiguration = this.userConfigurations[0];
          this.getPollDetails(this.selectedConfiguration.id);
          this._fillUpState(this.selectedConfiguration);
          this._fillPollsForm();
        }
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.openDialog(IMPORT_MESSAGES.ANSWERS_ERROR, 'error', err.message);
        this.resetForm();
      },
    });
  }
  getServiceProviders() {
    this.serviceProvidersService.getAllServiceProviders().subscribe({
      next: data => {
        this.serviceProviders = data;
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.openDialog(IMPORT_MESSAGES.ANSWERS_ERROR, 'error', err.message);
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

  onConfigurationChange(selectedConfiguration: ConfigurationsModel): void {
    this.selectedConfiguration = selectedConfiguration;
    this.getPollDetails(selectedConfiguration.id);
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

  private _fillUpState(configuration: ConfigurationsModel) {
    const state = history.state as {
      pollName?: string;
      endDate?: string;
      startDate?: string;
    };
    if (state?.pollName) {
      this.preselectedPollState = {
        configuration: configuration,
        surveyName: state.pollName,
        start: state.startDate!,
        end: state.endDate!,
      };
    }
  }

  private _fillPollsForm() {
    this.form
      .get('configuration')
      ?.setValue(this.preselectedPollState?.configuration);
    this.form
      .get('surveyName')
      ?.setValue(this.preselectedPollState?.surveyName);
    this.form.get('start')?.setValue(this.preselectedPollState?.start);
    this.form.get('end')?.setValue(this.preselectedPollState?.end ?? '');
  }
}
