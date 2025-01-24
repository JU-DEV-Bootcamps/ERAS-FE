import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnswerDialog } from './components/dialog/dialog.component';
import { formatDate } from '../../shared/utils/date-utils'
import { CostmicLatteService } from '../../core/services/cosmic-latte.service'

@Component({
  selector: 'app-import-answers',
  imports: [MatFormFieldModule, MatInputModule,MatDatepickerModule, MatButtonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './import-answers.component.html',
  styleUrl: './import-answers.component.css',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAnswersComponent {

  form: FormGroup;
  isLoading: boolean;

  constructor(private fb: FormBuilder, private dialog: MatDialog, private cosmicLatteService: CostmicLatteService) {
    this.form = this.fb.group({
      surveyName: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      start: '',
      end: ''
    });
    this.isLoading = false;
  }

  openDialog(titleMessage: string, descriptionMessage:string, isSuccess: boolean) {
    this.dialog.open(AnswerDialog, {
      data: {
        title: titleMessage,
        description: descriptionMessage,
        isSuccess: isSuccess
      },
    });
  }

  onSubmit() {
    const name = this.form.value.surveyName.trim();
    const startDate = this.form.value.start ? formatDate(new Date(this.form.value.start)) : "";
    const endDate = this.form.value.end ? formatDate(new Date(this.form.value.end)) : "";

    this.isLoading = true;

    this.cosmicLatteService.importAnswerBySurvey(name, startDate, endDate).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.openDialog('Successful', 'The survey’s answers were saved in the system successfully', true);
        this.resetForm()
      },
      error: (error) => {
        this.isLoading = false;
        this.openDialog('Warning', 'There was an error with the import, please try again or check the values.', false); 
        this.resetForm()
      }
    });
  }

  resetForm() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
