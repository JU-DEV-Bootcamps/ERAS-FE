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

  studentsMobileVersion: StudentPreview[] = [];
  totalStudents = 0;
  columns: (keyof StudentPreview)[] = ['#', 'name', 'email', 'cohort', 'save'];

  pollService = inject(PollService);
  clService = inject(CosmicLatteService);

  @Input() importedPollData: PollInstance[] = [];

  @Output() saveCompleted = new EventEmitter<{
    state: string;
    data: unknown;
  }>();

  studentListToExcludeSubject = new BehaviorSubject<string[]>([]);
  studentListToExclude$ = this.studentListToExcludeSubject.asObservable();

  allStudentsCheckedSubject = new BehaviorSubject<boolean>(true);
  allStudentsChecked$ = this.allStudentsCheckedSubject.asObservable();

  previewIsHiddenSubject = new BehaviorSubject<boolean>(false);
  previewIsHidden$ = this.previewIsHiddenSubject.asObservable();

  selectedStudents$ = this.studentListToExclude$.pipe(
    map(excluded => this.totalStudents - excluded.length)
  );

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['importedPollData']) {
      this.mapDataCreatedPoll(this.importedPollData);
    }
  }

  savePolls() {
    let pollsToSave;

    this.previewIsHiddenSubject.next(true);
    this.studentListToExclude$.pipe(first()).subscribe(excluded => {
      pollsToSave = this.importedPollData.filter(
        poll =>
          !excluded.includes(
            poll.components?.[0].variables?.[0].answer?.student?.email
          )
      );
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
    this.studentsMobileVersion = [];
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
    let updatedList = [...this.studentListToExcludeSubject.value];

    if (event.checked) {
      updatedList = updatedList.filter(email => email !== student.email);
    } else {
      updatedList.push(student.email);
      student.save = event.checked;
    }
    this.studentListToExcludeSubject.next(updatedList);
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
    this.studentListToExcludeSubject.next(updatedList);
    this.allStudentsCheckedSubject.next(event.checked);
  }
  mapDataCreatedPoll(data: PollInstance[]) {
    const created = [];
    this.totalStudents = data.length;
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
      created.push(student);
    }
    this.dataStudents = new MatTableDataSource(created);
    this.studentsMobileVersion = created;
  }
  isStudentElegible(student: StudentPreview): boolean {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexName = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

    return regexName.test(student.name) && regexEmail.test(student.email);
  }
}
