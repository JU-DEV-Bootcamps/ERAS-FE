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
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';
import { StudentService } from '@core/services/api/student.service';
import { UserDataService } from '@core/services/access/user-data.service';
import {
  ErasUserProfile,
  UsersService,
} from '@core/services/api/users.service';
import { ERASRoles } from '@core/models/profile.model';
import { forkJoin, map, Observable, of } from 'rxjs';
import { mapFields } from '@modules/supports-referrals/utils/fieldMapper';
import { AssessmentsLookups } from '../models/assessments.interfaces';
import { AssessmentListComponent } from './assessment-list/assessment-list.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';
import { AssessmentModel } from '@core/models/assessment.model';
import { EditAssessmentModalComponent } from './edit-assessment-modal/edit-assessment-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JuService } from '@modules/supports-referrals/models/referrals.interfaces';
import { Lookup } from '@core/models/lookup';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ERASPermissions } from '@core/services/permissions/permission.policies';

@Component({
  selector: 'app-assessments',
  imports: [AssessmentListComponent, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './assessments.component.html',
  styleUrl: './assessments.component.scss',
})
export class AssessmentsComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly juServicesService = inject(JuServicesService);
  private readonly usersService = inject(UsersService);
  private readonly studentService = inject(StudentService);
  private readonly userDataService = inject(UserDataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissionsService = inject(PermissionsService);

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
    forkJoin({
      profiles: of(mapFields([this.userDataService.user()!], 'fullName', 'id')),
      students: this.studentService
        .getAllStudentsLight()
        .pipe(map(students => mapFields(students, 'name', 'id'))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ profiles, students }) => {
          this.lookups.update(current => ({ ...current, profiles, students }));
        },
        error: err => {
          console.error('Error retrieving static lookups', err);
          this.lookupLoading.set(false);
        },
        complete: () => {
          this.lookupLoading.set(false);
          this.checkPreselectedStudent();
        },
      });
  }

  private getVolatileLookups(): Observable<
    Pick<AssessmentsLookups, 'services' | 'professionals'>
  > {
    return forkJoin({
      services: this.juServicesService.getAllJuServices({
        page: 0,
        pageSize: 1000,
      }),
      professionals: this.usersService.getByRole(ERASRoles.PROFESSIONAL),
    }).pipe(
      map(({ services, professionals }) => ({
        services: mapFields(services.items, 'name', 'name'),
        professionals: this.mapProfessionalsToLookups(professionals),
      }))
    );
  }

  private mapProfessionalsToLookups(
    professionals: ErasUserProfile[]
  ): Lookup[] {
    return professionals
      .filter(professional => !!professional.sub)
      .map(professional => ({
        label:
          `${professional.firstName} ${professional.lastName}`.trim() ||
          professional.email,
        value: professional.sub!,
      }));
  }

  private checkPreselectedStudent(): void {
    const preselectedStudentId = history.state?.preselectedStudentId as
      | number
      | undefined;
    if (preselectedStudentId) {
      this.openCreateModal(preselectedStudentId);
      history.replaceState({}, '');
    }
  }

  openCreateModal(preselectedStudentId?: number) {
    this.lookupLoading.set(true);
    let modalData: AssessmentsLookups = {
      ...this.lookups(),
      preselectedStudentId,
    };

    if (this.permissionsService.can(ERASPermissions.CAN_CREATE_SERVICES)) {
      modalData = {
        ...modalData,
        createService: this.createService.bind(this),
      };
    }
    this.getVolatileLookups()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ services, professionals }) => {
          this.lookups.update(current => ({
            ...current,
            services,
            professionals,
          }));
          this.lookupLoading.set(false);
          const dialogRef = this.matDialog.open(NewAssessmentModalComponent, {
            ...this.modalConfig,
            data: modalData,
          });

          dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.listComponent()?.loadAssessments());
        },
        error: err => {
          console.error('error: ', err);
          this.lookupLoading.set(false);
        },
      });
  }

  openEditModal(assessment: AssessmentModel) {
    this.lookupLoading.set(true);
    this.getVolatileLookups()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ services, professionals }) => {
          this.lookups.update(current => ({
            ...current,
            services,
            professionals,
          }));
          this.lookupLoading.set(false);
          const dialogRef = this.matDialog.open(EditAssessmentModalComponent, {
            ...this.modalConfig,
            data: { assessment, ...this.lookups() },
          });
          dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.listComponent()?.loadAssessments());
        },
        error: err => {
          console.error('Error retrieving lookups', err);
          this.lookupLoading.set(false);
        },
      });
  }

  openDeleteModal(assessment: AssessmentModel) {
    if (assessment.id === undefined) return;
    this.listComponent()?.loadAssessments();
  }

  private createService = (newService: string): Observable<Lookup> => {
    const service: JuService = {
      id: 0,
      name: newService,
      audit: {
        createdBy: 'configurator',
        createdAt: new Date(),
        modifiedBy: 'configurator',
        modifiedAt: new Date(),
      },
    };
    return this.juServicesService.addNewService(service).pipe(
      map(
        (created: JuService): Lookup => ({
          label: created.name,
          value: created.name,
        })
      )
    );
  };
}
