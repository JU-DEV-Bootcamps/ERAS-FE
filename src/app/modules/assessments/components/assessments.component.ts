import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';
import { ProfessionalsService } from '@modules/supports-referrals/services/professionals.service';
import { StudentService } from '@core/services/api/student.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import { mapFields } from '@modules/supports-referrals/utils/fieldMapper';
import { AssessmentsLookups } from '../models/assessments.interfaces';
import { AssessmentListComponent } from './assessment-list/assessment-list.component';
import { MatDialog } from '@angular/material/dialog';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';

@Component({
  selector: 'app-assessments',
  imports: [
    AssessmentListComponent,
    MatIconModule,
    MatProgressSpinnerModule,
    ErasButtonComponent,
  ],
  templateUrl: './assessments.component.html',
  styleUrl: './assessments.component.scss',
})
export class AssessmentsComponent implements OnInit, OnDestroy {
  private readonly matDialog = inject(MatDialog);
  private readonly juServicesService = inject(JuServicesService);
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly studentService = inject(StudentService);
  private readonly userDataService = inject(UserDataService);

  private lookups: WritableSignal<AssessmentsLookups> =
    signal<AssessmentsLookups>({
      profiles: [],
      services: [],
      professionals: [],
      students: [],
    });
  private subscription!: Subscription;

  lookupCompleted: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    this.subscription = this.getLookups().subscribe({
      next: lookups => this.lookups.set(lookups),
      error: err => console.log('Error retrieving lookups', err),
      complete: () => this.lookupCompleted.set(true),
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getLookups(): Observable<AssessmentsLookups> {
    return forkJoin({
      services: this.juServicesService.getAllJuServices(),
      professionals: this.professionalsService.getAllProfessionals(),
      students: this.studentService.getAllStudents(),
    }).pipe(
      map(({ services, professionals, students }) => {
        return {
          profiles: mapFields(
            [this.userDataService.user()!],
            'fullName',
            'fullName'
          ),
          services: mapFields(services.items, 'name', 'name'),
          professionals: mapFields(professionals.items, 'name', 'name'),
          students: mapFields(students.items, 'name', 'uuid'),
        };
      })
    );
  }

  openCreateModal() {
    this.matDialog.open(NewAssessmentModalComponent, {
      width: '40vw',
      minWidth: '400px',
      data: { ...this.lookups() },
    });
  }
}
