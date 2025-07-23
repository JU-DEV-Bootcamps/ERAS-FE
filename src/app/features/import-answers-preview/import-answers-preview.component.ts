import { AsyncPipe, NgClass, TitleCasePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BehaviorSubject, first, map } from 'rxjs';
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import { PollService } from '../../core/services/api/poll.service';
import { CosmicLatteService } from '../../core/services/api/cosmic-latte.service';
import { PollInstance } from '../../core/models/poll-instance.model';
import { PollPreview, StudentPreview } from '../interfaces/preview';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  isFieldEmailValid,
  isFieldNameValid,
} from '../../core/utilities/validators/fields.util';

@Component({
  selector: 'app-import-answers-preview',
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
    MatCheckboxModule,
    AsyncPipe,
    MatSlideToggle,
    NgClass,
    MatTooltipModule,
  ],
  templateUrl: './import-answers-preview.component.html',
  styleUrl: './import-answers-preview.component.scss',
})
export class ImportAnswersPreviewComponent implements OnChanges {
  isMobile = false;
  dataStudents: MatTableDataSource<StudentPreview> =
    new MatTableDataSource<StudentPreview>([]);
  pollDetails: PollPreview = {
    name: '',
    version: '',
    cosmicLatteId: '',
    components: [],
  };

  studentPreviews: StudentPreview[] = [];
  totalStudents = 0;
  columns: (keyof StudentPreview)[] = ['#', 'name', 'email', 'cohort', 'save'];

  pollService = inject(PollService);
  clService = inject(CosmicLatteService);

  @Input() importedPollData: PollInstance[] = [];

  @Output() saveCompleted = new EventEmitter<{
    state: string;
    data: unknown;
  }>();

  studentExcludedEmailsSubject = new BehaviorSubject<string[]>([]);
  studentExcludedEmails$ = this.studentExcludedEmailsSubject.asObservable();

  allStudentsCheckedSubject = new BehaviorSubject<boolean>(true);
  allStudentsChecked$ = this.allStudentsCheckedSubject.asObservable();

  invalidStudentsSubject = new BehaviorSubject<string[]>([]);
  invalidStudents$ = this.invalidStudentsSubject.asObservable();

  previewIsHiddenSubject = new BehaviorSubject<boolean>(false);
  previewIsHidden$ = this.previewIsHiddenSubject.asObservable();

  selectedStudents$ = this.studentExcludedEmails$.pipe(
    map(
      excluded =>
        this.totalStudents -
        excluded.length -
        this.invalidStudentsSubject.value.length
    )
  );

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['importedPollData']) {
      this.mapDataCreatedPoll(this.importedPollData);
      this.getInvalidStudents(this.studentPreviews);
      this.selectedStudents$ = this.studentExcludedEmails$.pipe(
        map(
          excluded =>
            this.totalStudents -
            excluded.length -
            this.invalidStudentsSubject.value.length
        )
      );
    }
  }

  savePolls() {
    let pollsToSave;

    this.previewIsHiddenSubject.next(true);
    this.studentExcludedEmails$.pipe(first()).subscribe(excluded => {
      const invalidStudents = this.invalidStudentsSubject.value;

      pollsToSave = this.importedPollData.filter(poll => {
        const student = poll.components?.[0].variables?.[0].answer?.student;
        return (
          !excluded.includes(student.email) &&
          !invalidStudents.includes(student.email)
        );
      });
    });

    this.saveCompleted.emit({ state: 'pending', data: null });
    this.clService
      .savePollsCosmicLattePreview(pollsToSave as unknown as PollInstance[])
      .subscribe({
        next: data => {
          this.saveCompleted.emit({ state: 'true', data: data });
          this.resetAllDataPolls();
        },
        error: error => {
          this.previewIsHiddenSubject.next(false);
          this.saveCompleted.emit({ state: 'false', data: error });
        },
      });
  }
  resetAllDataPolls() {
    this.dataStudents = new MatTableDataSource<StudentPreview>([]);
    this.studentPreviews = [];
    this.totalStudents = 0;
    this.pollDetails = {
      name: '',
      version: '',
      cosmicLatteId: '',
      components: [],
    };
    this.importedPollData = [];
  }
  handleCheckbox(event: MatSlideToggleChange, student: StudentPreview) {
    let updatedList = [...this.studentExcludedEmailsSubject.value];

    if (event.checked) {
      updatedList = updatedList.filter(email => email !== student.email);
    } else {
      updatedList.push(student.email);
      student.save = event.checked;
    }
    this.studentExcludedEmailsSubject.next(updatedList);
    this.allStudentsCheckedSubject.next(!updatedList.length);
  }

  handleAllCheckboxs(event: MatSlideToggleChange) {
    const updatedList: string[] = [];
    this.dataStudents.filteredData.forEach((student: StudentPreview) => {
      if (!event.checked) {
        updatedList.push(student.email);
      }
      student.save = event.checked;
    });
    this.studentExcludedEmailsSubject.next(updatedList);
    this.allStudentsCheckedSubject.next(event.checked);
  }
  mapDataCreatedPoll(data: PollInstance[]) {
    const studentPreviews: StudentPreview[] = [];

    this.totalStudents = data.length;
    this.pollDetails.components = [];
    for (let i = 0; data.length > i; i++) {
      if (i == 0) {
        this.pollDetails.name = data[i].name;
        this.pollDetails.version = data[i].version;
        this.pollDetails.cosmicLatteId = data[i].idCosmicLatte;
        data[i].components.forEach(comp =>
          this.pollDetails.components.push(comp.name)
        );
      }
      const name = data[i].components[0].variables[0].answer.student.name;
      const email = data[i].components[0].variables[0].answer.student.email;
      const cohort =
        data[i].components[0].variables[0].answer.student.cohort.name;
      const student: StudentPreview = {
        '#': i + 1,
        name: name,
        email: email,
        cohort: cohort,
        save: true,
      };

      studentPreviews.push(student);
    }
    this.dataStudents = new MatTableDataSource(studentPreviews);
    this.studentPreviews = studentPreviews;
  }

  getInvalidStudents(studentPreviews: StudentPreview[]) {
    const invalidStudents: string[] = [];

    studentPreviews.forEach(student => {
      if (!this.isStudentValid(student)) {
        invalidStudents.push(student.email);
      }
    });
    this.invalidStudentsSubject.next(invalidStudents);
  }
  isStudentValid(student: StudentPreview): boolean {
    return isFieldNameValid(student.name) && isFieldEmailValid(student.email);
  }
}
