import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterventionsComponent } from './interventions.component';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AssessmentModel,
  AssessmentStatus,
  InterventionMode,
  InterventionModel,
  InterventionType,
} from '@core/models/assessment.model';
import { of, throwError } from 'rxjs';
import {
  AppliedFilter,
  FilterName,
} from '@shared/components/list-filters/models/list-filters.interface';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { InterventionService } from '@core/services/api/intervention.service';
import { MatDialog } from '@angular/material/dialog';
import { NewInterventionModalComponent } from './new-intervention-modal/new-intervention-modal.component';
import { EditInterventionModalComponent } from './edit-intervention-modal/edit-intervention-modal.component';
import { RoleBasedFetchResolver } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.resolver';

const assessments: AssessmentModel[] = [
  {
    id: 1,
    createdAtUtc: '2026-07-03T10:00:00Z',
    createdBy: 'admin',
    service: 'Support',
    studentIds: ['103', '215'],
    status: AssessmentStatus.Remitted,
    interventions: [],
  },
  {
    id: 2,
    createdAtUtc: '2026-07-03T10:00:00Z',
    createdBy: 'admin',
    service: 'Counseling',
    studentIds: ['108', '63'],
    status: AssessmentStatus.InProgress,
    interventions: [],
  },
  {
    id: 3,
    createdAtUtc: '2026-07-03T10:00:00Z',
    createdBy: 'admin',
    service: 'Psychology',
    studentIds: ['2', '456'],
    status: AssessmentStatus.Finalized,
    interventions: [],
  },
];

const intervention: InterventionModel = {
  id: 15,
  status: 'Remitted',
} as InterventionModel;

describe('InterventionsComponent', () => {
  let component: InterventionsComponent;
  let fixture: ComponentFixture<InterventionsComponent>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let interventionServiceSpy: jasmine.SpyObj<InterventionService>;
  let toastServiceSpy: jasmine.SpyObj<ToastNotificationService>;
  let fetchResolverMock: jasmine.SpyObj<RoleBasedFetchResolver>;

  const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
  dialogRef.afterClosed.and.returnValue(of(undefined));

  beforeEach(async () => {
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    fetchResolverMock = jasmine.createSpyObj('RoleBasedFetchResolver', [
      'resolve',
    ]);
    interventionServiceSpy = jasmine.createSpyObj<InterventionService>(
      'InterventionService',
      ['deleteIntervention']
    );
    toastServiceSpy = jasmine.createSpyObj<ToastNotificationService>(
      'ToastNotificationService',
      ['showToast']
    );

    fetchResolverMock.resolve.and.returnValue(of(assessments));
    dialog.open.and.returnValue(dialogRef);

    await TestBed.configureTestingModule({
      imports: [InterventionsComponent],
      providers: [
        provideHttpClient(),
        { provide: InterventionService, useValue: interventionServiceSpy },
        { provide: ToastNotificationService, useValue: toastServiceSpy },
        { provide: MatDialog, useValue: dialog },
        { provide: RoleBasedFetchResolver, useValue: fetchResolverMock },
      ],
    })
      .overrideComponent(InterventionsComponent, {
        set: {
          providers: [{ provide: MatDialog, useValue: dialog }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(InterventionsComponent);
    component = fixture.componentInstance;

    component.interventionList = jasmine.createSpyObj(
      'InterventionListComponent',
      ['loadInterventions']
    );
  });

  afterEach(() => {
    dialogRef.afterClosed.and.returnValue(of(undefined));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(TestBed.inject(MatDialog)).toBe(dialog);
  });

  it('should build assessment, type, and status filters once assessments load', () => {
    fixture.detectChanges();

    const filters = component.filters();
    const assessmentFilter = filters.find(
      f => f.name === FilterName.Assessment
    );
    const statusFilter = filters.find(f => f.name === FilterName.Status);
    const typeFilter = filters.find(f => f.name === FilterName.Type);
    const riskFilter = filters.find(f => f.name === FilterName.Risk);

    expect(assessmentFilter).toBeDefined();
    expect(statusFilter).toBeDefined();
    expect(typeFilter).toBeDefined();
    expect(riskFilter).toBeDefined();
  });

  it('should build assessment options with the loaded assessments', () => {
    component['allAssessments'].set(assessments);
    fixture.detectChanges();

    const filters = component.filters();
    const assessmentFilter = filters.find(
      f => f.name === FilterName.Assessment
    );

    expect(assessmentFilter).toBeDefined();
    expect(assessmentFilter?.options?.length).toBe(assessments.length);
    expect(assessmentFilter?.options?.[0].label).toBe(
      '07/03/2026 – Support (Remitted)'
    );
    expect(assessmentFilter?.options?.[1].label).toBe(
      '07/03/2026 – Counseling (In Progress)'
    );
    expect(assessmentFilter?.options?.[2].label).toBe(
      '07/03/2026 – Psychology (Finalized)'
    );
  });

  it('should set selectedAssessmentId when an Assessment filter with a value is present', () => {
    component.handleFilters([{ name: FilterName.Assessment, value: 2 }]);
    expect(component.selectedAssessmentId()).toBe(2);
  });

  it('should not change selectedAssessmentId if there is no Assessment filter', () => {
    component.onAssessmentChange(1);
    component.handleFilters([
      { name: FilterName.Type, value: 'virtual-select' },
    ]);
    expect(component.selectedAssessmentId()).toBe(1);
  });

  it('should not update selectedAssessmentId when the Assessment filter value is falsy', () => {
    component.onAssessmentChange(5);
    component.handleFilters([{ name: FilterName.Assessment, value: null }]);
    expect(component.selectedAssessmentId()).toBe(5);
  });

  it('should store the applied filters', () => {
    const filters: AppliedFilter[] = [
      { name: FilterName.Assessment, value: 2 },
    ];
    component.handleFilters(filters);
    expect(component.appliedFilters()).toEqual(filters);
  });

  it('should handle errors while loading assessments', () => {
    fetchResolverMock.resolve.and.returnValue(
      throwError(() => new Error('network error'))
    );

    fixture.detectChanges();

    expect(component.isLoadingAssessments()).toBe(false);
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Error fetching assessments',
      message: 'network error',
    });
  });

  it('should use the provided student data when building the student lookup', () => {
    const assessmentsWithStudents: AssessmentModel[] = [
      {
        id: 1,
        createdAtUtc: '2026-07-03T10:00:00Z',
        createdBy: 'admin',
        service: 'Support',
        studentIds: ['103'],
        students: [
          {
            id: 103,
            name: 'Ana Perez',
            email: 'ana@test.com',
            avgRiskLevel: 2,
          },
        ],
        status: AssessmentStatus.Remitted,
        interventions: [],
      },
    ];
    fetchResolverMock.resolve.and.returnValue(of(assessmentsWithStudents));

    fixture.detectChanges();

    expect(component.studentNamesLookup()['103']).toEqual({
      id: 103,
      name: 'Ana Perez',
      email: 'ana@test.com',
      avgRiskLevel: 2,
    });
  });

  it('should not open create modal when no assessment is selected', () => {
    component.openCreateModal();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should not open create modal when assessment is not found', () => {
    component['allAssessments'].set([]);
    component.onAssessmentChange(1);
    component.openCreateModal();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should not open edit modal when no assessment is selected', () => {
    component.openEditModal(intervention);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should not open edit modal without selecteed assessment', () => {
    component.onAssessmentChange(1);
    component['allAssessments'].set([]);
    component.openEditModal(intervention);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should not open confirmation dialog without selected intervention', () => {
    component.confirmDelete(intervention);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should not open confirmation dialog without selected assessment', () => {
    component.onAssessmentChange(1);
    component.confirmDelete(intervention);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should open create intervention dialog', () => {
    component.onAssessmentChange(1);
    component.handleFilters([
      { name: FilterName.Type, value: 'virtual-select' },
    ]);
    component['allAssessments'].set(assessments);

    component.openCreateModal();
    expect(dialog.open).toHaveBeenCalledWith(
      NewInterventionModalComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          assessmentId: 1,
          professional: {
            value: '',
            label: '',
          },
          students: [
            { value: '103', label: '103', riskLevel: 0 },
            { value: '215', label: '215', riskLevel: 0 },
          ],
        }),
      })
    );
  });

  it('should map real student names and risk levels when opening the create modal', () => {
    const assessmentWithStudents: AssessmentModel = {
      id: 1,
      createdAtUtc: '2026-07-03T10:00:00Z',
      createdBy: 'admin',
      service: 'Support',
      studentIds: ['103'],
      students: [{ id: 103, name: 'Ana Perez', email: '', avgRiskLevel: 4 }],
      status: AssessmentStatus.Remitted,
      interventions: [],
    };
    component['allAssessments'].set([assessmentWithStudents]);
    component.onAssessmentChange(1);

    component.openCreateModal();

    expect(dialog.open).toHaveBeenCalledWith(
      NewInterventionModalComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          students: [{ value: '103', label: 'Ana Perez', riskLevel: 4 }],
        }),
      })
    );
  });

  it('should open edit intervention dialog', () => {
    const exampleIntervention: InterventionModel = {
      id: 10,
      assessmentId: 1,
      kind: InterventionType.Individual,
      mode: InterventionMode.InPlace,
      dateUtc: '',
      studentIds: [2],
    };

    const assessment: AssessmentModel = {
      id: 1,
      createdAtUtc: '',
      createdBy: 'me',
      service: 'Support',
      studentIds: ['2'],
      students: [
        {
          id: 2,
          name: 'John Doe',
          email: '',
          avgRiskLevel: 3,
        },
      ],
      assignedProfessional: 'Jane Smith',
      interventions: [exampleIntervention],
      status: AssessmentStatus.Finalized,
    };

    component['allAssessments'].set([assessment]);
    component.onAssessmentChange(1);

    component.openEditModal(intervention);

    expect(dialog.open).toHaveBeenCalledWith(
      EditInterventionModalComponent,
      jasmine.objectContaining({
        width: '520px',
        disableClose: true,
        data: {
          assessmentId: 1,
          professional: {
            value: 'Jane Smith',
            label: 'Jane Smith',
          },
          students: [
            {
              value: '2',
              label: 'John Doe',
              riskLevel: 3,
            },
          ],
          intervention: intervention,
        },
      })
    );
  });

  it('should fall back to the student id and default professional when opening edit without student data', () => {
    const assessmentNoStudents: AssessmentModel = {
      id: 1,
      createdAtUtc: '',
      createdBy: 'me',
      service: 'Support',
      studentIds: ['2'],
      interventions: [],
      status: AssessmentStatus.Finalized,
    };

    component['allAssessments'].set([assessmentNoStudents]);
    component.onAssessmentChange(1);

    component.openEditModal(intervention);

    expect(dialog.open).toHaveBeenCalledWith(
      EditInterventionModalComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          professional: { value: '', label: '' },
          students: [{ value: '2', label: '2', riskLevel: 0 }],
        }),
      })
    );
  });

  it('should not delete the intervention when the confirmation dialog is dismissed', () => {
    dialogRef.afterClosed.and.returnValue(of(false));
    component.onAssessmentChange(1);

    component.confirmDelete(intervention);

    expect(interventionServiceSpy.deleteIntervention).not.toHaveBeenCalled();
  });

  it('should delete the intervention and show a success toast when confirmed', () => {
    dialogRef.afterClosed.and.returnValue(of(true));
    interventionServiceSpy.deleteIntervention.and.returnValue(of(void 0));
    component.onAssessmentChange(1);

    component.confirmDelete(intervention);

    expect(interventionServiceSpy.deleteIntervention).toHaveBeenCalledWith(
      1,
      intervention.id!
    );
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith({
      title: 'Intervention removed successfully',
      message: `Intervention with id: ${intervention.id} was removed`,
      type: 'success',
    });
    expect(component.interventionList.loadInterventions).toHaveBeenCalledWith(
      1
    );
  });

  it('should show a status-based error toast when deletion fails for a non-Remitted intervention', () => {
    dialogRef.afterClosed.and.returnValue(of(true));
    spyOn(console, 'error');
    const nonRemitted: InterventionModel = {
      id: 20,
      status: 'InProgress',
    } as InterventionModel;
    interventionServiceSpy.deleteIntervention.and.returnValue(
      throwError(() => ({ statusText: 'Not Found' }) as HttpErrorResponse)
    );
    component.onAssessmentChange(1);

    component.confirmDelete(nonRemitted);

    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      {
        title: 'Intervention removed failed',
        message: `The item with id: ${nonRemitted.id} cannot be removed due to its status.`,
        type: 'error',
      },
      true
    );
  });

  it('should show a not-found error toast when deletion fails for a Remitted intervention', () => {
    dialogRef.afterClosed.and.returnValue(of(true));
    spyOn(console, 'error');
    const remitted: InterventionModel = {
      id: 21,
      status: 'Remitted',
    } as InterventionModel;
    interventionServiceSpy.deleteIntervention.and.returnValue(
      throwError(() => ({ statusText: 'Not Found' }) as HttpErrorResponse)
    );
    component.onAssessmentChange(1);

    component.confirmDelete(remitted);

    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      {
        title: 'Intervention removed failed',
        message: `Not Found: The item was not found with id: ${remitted.id}`,
        type: 'error',
      },
      true
    );
  });
});
