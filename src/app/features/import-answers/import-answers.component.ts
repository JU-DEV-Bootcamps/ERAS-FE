import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  HostListener,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PollInstance } from '../../core/services/Types/cosmicLattePollImportList';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CostmicLatteService } from '../../core/services/cosmic-latte.service';
import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  IMPORT_MESSAGES,
  GENERAL_MESSAGES,
} from '../../core/constants/messages';
import { ModalComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';

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
    TitleCasePipe,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './import-answers.component.html',
  styleUrl: './import-answers.component.css',
  providers: [provideNativeDateAdapter(), DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAnswersComponent {
  form: FormGroup;
  isLoading: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pollsNames: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importedPollData: any = [];
  columns = ['#', 'name', 'email', 'cohort', 'actions'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataStudents: any = new MatTableDataSource([]);
  students = [];
  pageSize = 10;
  currentPage = 0;
  totalStudents = 0;

  isMobile = false;

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

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    this.getPollDetails();
    this.checkScreenSize();
  }
  private openDialog(descriptionMessage: string, isSuccess: boolean): void {
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

  mapDataCreatedPolls(data: PollInstance[]) {
    // columns = ['index', 'name', 'email', 'cohort'];
    const created = [];
    for (let i = 0; data.length > i; i++) {
      const name = data[i].components[0].variables[0].answer.student.name;
      const email = data[i].components[0].variables[0].answer.student.email;
      const cohort =
        data[i].components[0].variables[0].answer.student.cohort.name;
      const record: savedPollRecord = {
        '#': i,
        name: name,
        email: email,
        cohort: cohort,
      };
      created.push(record);
    }
    this.dataStudents = new MatTableDataSource(created);
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
        next: (data: PollInstance[]) => {
          this.mapDataCreatedPolls(data);
          this.importedPollData = data;
          this.isLoading = false;
          this.openDialog(IMPORT_MESSAGES.ANSWERS_SUCCESS, true);
          this.resetForm();
        },
        error: () => {
          this.isLoading = false;
          this.openDialog(IMPORT_MESSAGES.ANSWERS_ERROR, false);
          this.resetForm();
        },
      });
  }

  getPollDetails() {
    this.cosmicLatteService.getPollNames().subscribe({
      next: data => {
        this.pollsNames = data;
      },
      error: () => {
        this.isLoading = false;
        this.openDialog(IMPORT_MESSAGES.ANSWERS_ERROR, false);
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

  onPageChange({
    pageSize,
    pageIndex,
  }: {
    pageIndex: number;
    pageSize: number;
  }): void {
    this.currentPage = pageIndex;
    this.pageSize = pageSize;
  }
}

interface savedPollRecord {
  '#': number;
  name: string;
  email: string;
  cohort: string;
}
