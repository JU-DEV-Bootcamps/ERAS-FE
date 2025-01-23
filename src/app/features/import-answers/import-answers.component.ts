import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AnswerDialog } from './components/dialog/dialog.component';
import { formatDate } from '../../shared/utils/date-utils'

@Component({
  selector: 'app-import-answers',
  imports: [MatFormFieldModule, MatInputModule,MatDatepickerModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './import-answers.component.html',
  styleUrl: './import-answers.component.css',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportAnswersComponent {

  form: FormGroup;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.form = this.fb.group({
      surveyName: '',
      start: '',
      end: ''
    });
  }

  openDialog() {
    this.dialog.open(AnswerDialog, {
      data: this.form.value,
    });
  }

  onSubmit() {
    const name = this.form.value.surveyName;
    const startDate = formatDate(new Date(this.form.value.start)) 
    const endDate = formatDate(new Date(this.form.value.end)) 
    this.openDialog();
  }


}
