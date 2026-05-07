import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';
import { ProfessionalsService } from '@modules/supports-referrals/services/professionals.service';
import { StudentService } from '@core/services/api/student.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { forkJoin, map, Observable } from 'rxjs';
import { mapFields } from '@modules/supports-referrals/utils/fieldMapper';
import { AssessmentsLookups } from '../models/assessments.interfaces';
import { AssessmentListComponent } from './assessment-list/assessment-list.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';
import { AssessmentModel } from '@core/models/assessement.model';
import { EditAssessmentModalComponent } from './edit-assessment-modal/edit-assessment-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class AssessmentsComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly juServicesService = inject(JuServicesService);
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly studentService = inject(StudentService);
  private readonly userDataService = inject(UserDataService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly listComponent = viewChild(AssessmentListComponent);

  private lookups: WritableSignal<AssessmentsLookups> =
    signal<AssessmentsLookups>({
      profiles: [],
      services: [],
      professionals: [],
      students: [],
    });

  private modalConfig: MatDialogConfig = {
    autoFocus: false,
    minWidth: '500px',
    width: '40vw',
    panelClass: 'assessment-modal-panel',
  };

  lookupLoading: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    this.lookupLoading.set(true);
    this.getLookups()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: lookups => this.lookups.set(lookups),
        error: err => console.error('Error retrieving lookups', err),
        complete: () => this.lookupLoading.set(false),
      });
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
    const dialogRef = this.matDialog.open(NewAssessmentModalComponent, {
      ...this.modalConfig,
      data: { ...this.lookups() },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.listComponent()?.loadAssessments());
  }

  openEditModal(assessment: AssessmentModel) {
    const dialogRef = this.matDialog.open(EditAssessmentModalComponent, {
      ...this.modalConfig,
      data: { assessment, ...this.lookups() },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.listComponent()?.loadAssessments());
  }
}
