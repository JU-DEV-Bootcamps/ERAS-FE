import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnswerDialogComponent } from './components/dialog/dialog.component';
import { CostmicLatteService } from '../../core/services/cosmic-latte.service';
import { DatePipe } from '@angular/common';
import {
  IMPORT_MESSAGES,
  GENERAL_MESSAGES,
} from '../../core/constants/messages';

@Component({
  selector: 'app-import-answers',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './import-answers.component.html',
  styleUrl: './import-answers.component.css',
  providers: [provideNativeDateAdapter(), DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAnswersComponent {
  form: FormGroup;
  isLoading: boolean;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cosmicLatteService: CostmicLatteService,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      surveyName: ['', [Validators.pattern(/^(?!\s*$).+/)]],
      start: '',
      end: '',
    });
    this.isLoading = false;
  }

  openDialog(
    titleMessage: string,
    descriptionMessage: string,
    isSuccess: boolean
  ) {
    this.dialog.open(AnswerDialogComponent, {
      data: {
        title: titleMessage,
        description: descriptionMessage,
        isSuccess: isSuccess,
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const name = this.form.value.surveyName.trim();
    const startDate = this.formatDate(new Date(this.form.value.start));
    const endDate = this.formatDate(new Date(this.form.value.end));

    this.isLoading = true;

    this.cosmicLatteService
      .importAnswerBySurvey(name, startDate, endDate)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.openDialog(
            GENERAL_MESSAGES.SUCCESS_TITLE,
            IMPORT_MESSAGES.ANSWERS_SUCCESS,
            true
          );
          this.resetForm();
        },
        error: () => {
          this.isLoading = false;
          this.openDialog(
            GENERAL_MESSAGES.ERROR_TITLE,
            IMPORT_MESSAGES.ANSWERS_ERROR,
            false
          );
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
