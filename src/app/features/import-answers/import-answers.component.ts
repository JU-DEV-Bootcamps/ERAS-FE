import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  GENERAL_MESSAGES,
  IMPORT_MESSAGES,
} from '../../core/constants/messages';
import { CosmicLatteService } from '../../core/services/cosmic-latte.service';
import { PollInstance } from '../../core/services/interfaces/cosmic-latte-poll-import-list.interface';
import { ModalComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ImportAnswersPreviewComponent } from '../import-answers-preview/import-answers-preview.component';

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
  styleUrl: './import-answers.component.css',
  providers: [provideNativeDateAdapter(), DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAnswersComponent {
  form: FormGroup;

  loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.loadingSubject.asObservable();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pollsNames: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importedPollData: any = [];
  columns = ['#', 'name', 'email', 'cohort', 'actions'];
  students = [];
  preselectedPollState;

  isMobile = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cosmicLatteService: CosmicLatteService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    const state = history.state as {
      pollName?: string;
      endDate?: string;
      startDate?: string;
    };
    if (state?.pollName) {
      this.preselectedPollState = {
        surveyName: state.pollName,
        start: state.startDate,
        end: state.endDate,
      };
    }
    this.form = this.fb.group({
      surveyName: [
        this.preselectedPollState?.surveyName ?? '',
        [Validators.pattern(/^(?!\s*$).+/)],
      ],
      start: this.preselectedPollState?.start ?? '',
      end: this.preselectedPollState?.end ?? '',
    });
    this.getPollDetails();
    this.checkScreenSize();
  }
  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  private openDialog(
    descriptionMessage: string,
    isSuccess: boolean,
    extraMessage?: string
  ): void {
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
          message: extraMessage,
        },
      },
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
      .importAnswerBySurvey(name, startDate, endDate)
      .subscribe({
        next: (data: PollInstance[]) => {
          this.importedPollData = data;
          this.loadingSubject.next(false);
          this.resetForm();
          if (data.length < 1) {
            this.openDialog(IMPORT_MESSAGES.ANSWERS_PREVIEW_EMPTY, true);
          } else {
            this.openDialog(IMPORT_MESSAGES.ANSWERS_PREVIEW_OK, true);
          }
        },
        error: err => {
          this.loadingSubject.next(false);
          this.openDialog(
            IMPORT_MESSAGES.ANSWERS_ERROR,
            false,
            err?.error?.message
          );
          this.resetForm();
        },
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSavePollState(event: any) {
    if (event.state == 'pending') {
      this.loadingSubject.next(true);
    } else if (event.state == 'true') {
      this.loadingSubject.next(false);
      this.importedPollData = [];
      this.resetForm();
      this.openDialog('Polls saved successfully!', true);
    } else {
      this.loadingSubject.next(false);
      this.openDialog('Error saving polls. Please try again.', false);
    }
  }
  getPollDetails() {
    this.cosmicLatteService.getPollNames().subscribe({
      next: data => {
        this.pollsNames = data;
        this.loadingSubject.next(false);
      },
      error: err => {
        this.loadingSubject.next(false);
        this.openDialog(IMPORT_MESSAGES.ANSWERS_ERROR, false, err.message);
        this.resetForm();
      },
    });
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
}
