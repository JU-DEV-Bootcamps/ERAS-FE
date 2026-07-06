import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterventionsComponent } from './interventions.component';
import { provideHttpClient } from '@angular/common/http';
import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { of } from 'rxjs';
import {
  AppliedFilter,
  FilterName,
} from '@shared/components/list-filters/models/list-filters.interface';

// Helpers
const assessments: AssessmentModel[] = [
  {
    id: 1,
    createdAtUtc: '2026-07-03T10:00:00Z',
    createdBy: 'admin',
    service: 'Support',
    studentIds: ['103', '215'],
    status: AssessmentStatus.Created,
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
    status: AssessmentStatus.Rejected,
    interventions: [],
  },
];

describe('InterventionsComponent', () => {
  let component: InterventionsComponent;
  let fixture: ComponentFixture<InterventionsComponent>;

  let assessmentServiceSpy: jasmine.SpyObj<AssessmentService>;

  beforeEach(async () => {
    assessmentServiceSpy = jasmine.createSpyObj('AssessmentService', [
      'getAll',
    ]);

    // Default AssessmentService.getAll value
    assessmentServiceSpy.getAll.and.returnValue(of(assessments));

    await TestBed.configureTestingModule({
      imports: [InterventionsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should build assessment, type, and status filters once assessments load', () => {
    fixture.detectChanges();

    const filters = component.filters();
    const assessmentFilter = filters.find(
      f => f.name === FilterName.Assessment
    );
    const statusFilter = filters.find(f => f.name === FilterName.Status);
    const typeFilter = filters.find(f => f.name === FilterName.Type);

    expect(assessmentFilter).toBeDefined();
    expect(statusFilter).toBeDefined();
    expect(typeFilter).toBeDefined();
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
      '07/03/2026 – Support (Created)'
    );
    expect(assessmentFilter?.options?.[1].label).toBe(
      '07/03/2026 – Counseling (In Progress)'
    );
    expect(assessmentFilter?.options?.[2].label).toBe(
      '07/03/2026 – Psychology (Rejected)'
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

  it('should store the applied filters', () => {
    const filters: AppliedFilter[] = [
      { name: FilterName.Assessment, value: 2 },
    ];
    component.handleFilters(filters);

    expect(component.appliedFilters()).toEqual(filters);
  });
});
