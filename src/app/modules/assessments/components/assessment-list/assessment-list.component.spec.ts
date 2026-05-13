import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssessmentListComponent } from './assessment-list.component';
import { AssessmentStatus } from '../../../../core/models/assessement.model';
import { AssessmentModel } from '../../../../core/models/assessement.model';
import { AssessmentService } from '../../../../core/services/api/assessement.service';

describe('AssessmentListComponent', () => {
  let component: AssessmentListComponent;
  let fixture: ComponentFixture<AssessmentListComponent>;

  const mockAssessments: AssessmentModel[] = [
    {
      id: 1,
      createdAtUtc: '2026-03-30T00:00:00Z',
      createdBy: 'Roberto Alvarez',
      service: 'Student Services',
      assignedProfessional: 'Master',
      studentIds: ['Jane Doe'],
      comments: 'Some comment for preview testing',
      status: AssessmentStatus.Created,
      interventions: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentListComponent],
      providers: [
        {
          provide: AssessmentService,
          useValue: {
            getAll: () => of(mockAssessments),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
