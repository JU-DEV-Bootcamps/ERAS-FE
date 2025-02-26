import { TitleCasePipe } from '@angular/common';
import {
  Component,
  HostListener,
  Input,
  OnChanges,
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
import { PollInstance } from '../../core/services/Types/cosmicLattePollImportList';

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
  ],
  templateUrl: './import-answers-preview.component.html',
  styleUrl: './import-answers-preview.component.scss',
})
export class ImportAnswersPreviewComponent implements OnChanges {
  isMobile = false;
  students = [];
  selectedStudents = 0;
  totalStudents = 0;
  columns = ['#', 'name', 'email', 'cohort', 'actions'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataStudents: any = new MatTableDataSource([]);
  pollDetails: PollPreview = {
    name: '',
    version: '',
    cosmicLatteId: '',
    components: [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() importedPollData: any[] = [];

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['importedPollData']) {
      this.mapDataCreatedPoll(this.importedPollData);
    }
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
      };
      created.push(student);
    }
    this.dataStudents = new MatTableDataSource(created);
  }
}

interface PollPreview {
  name: string;
  version: string;
  cosmicLatteId: string;
  components: string[];
}
interface StudentPreview {
  '#': number;
  name: string;
  email: string;
  cohort: string;
}
