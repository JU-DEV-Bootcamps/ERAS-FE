import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalRiskStudentsCohortComponent } from './modal-risk-students-cohort.component';
import { of } from 'rxjs';
import { HeatMapService } from '../../../core/services/heat-map.service';
import { CohortService } from '../../../core/services/cohort.service';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ModalRiskStudentsCohortComponent', () => {
  let component: ModalRiskStudentsCohortComponent;
  let fixture: ComponentFixture<ModalRiskStudentsCohortComponent>;
  let heatMapServiceSpy: jasmine.SpyObj<HeatMapService>;
  let cohortServiceSpy: jasmine.SpyObj<CohortService>;
  let dialogRefSpy: jasmine.SpyObj<
    MatDialogRef<ModalRiskStudentsCohortComponent>
  >;

  beforeEach(waitForAsync(() => {
    const heatMapSpy = jasmine.createSpyObj('HeatMapService', [
      'getStudentHeatMapDetailsByCohort',
    ]);
    const cohortSpy = jasmine.createSpyObj('CohortService', ['getCohorts']);
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ModalRiskStudentsCohortComponent],
      providers: [
        { provide: HeatMapService, useValue: heatMapSpy },
        { provide: CohortService, useValue: cohortSpy },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    heatMapServiceSpy = TestBed.inject(
      HeatMapService
    ) as jasmine.SpyObj<HeatMapService>;
    cohortServiceSpy = TestBed.inject(
      CohortService
    ) as jasmine.SpyObj<CohortService>;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<ModalRiskStudentsCohortComponent>
    >;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRiskStudentsCohortComponent);
    component = fixture.componentInstance;

    cohortServiceSpy.getCohorts.and.returnValue(
      of([
        {
          id: 1,
          name: 'Test Cohort',
          courseCode: 'CS101',
          audit: {
            createdBy: 'tester',
            modifiedBy: 'tester',
            createdAt: '2025-03-12T00:00:00Z',
            modifiedAt: '2025-03-12T00:00:00Z',
          },
        },
      ])
    );
    heatMapServiceSpy.getStudentHeatMapDetailsByCohort.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate cohorts on initialization', () => {
    expect(component.cohorts.length).toBe(1);
    expect(component.cohorts[0].name).toEqual('Test Cohort');
  });

  it('should call getStudentHeatMapDetailsByCohort when form is valid', (done: DoneFn) => {
    component.form.setValue({ cohort: '1', limit: 5 });
    setTimeout(() => {
      expect(
        heatMapServiceSpy.getStudentHeatMapDetailsByCohort
      ).toHaveBeenCalledWith('1', 5);
      done();
    }, 600);
  });

  it('should close the dialog when onNoClick is called', () => {
    component.closeDialog();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
