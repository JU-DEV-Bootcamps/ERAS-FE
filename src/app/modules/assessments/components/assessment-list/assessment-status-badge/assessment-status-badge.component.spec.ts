import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentStatusBadgeComponent } from './assessment-status-badge.component';
import { AssessmentStatus } from '@core/models/assessment.model';

describe('AssessmentStatusBadge', () => {
  let component: AssessmentStatusBadgeComponent;
  let fixture: ComponentFixture<AssessmentStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentStatusBadgeComponent);
    component = fixture.componentInstance;
  });

  function getStatusBadge(): HTMLSpanElement {
    return fixture.nativeElement.querySelector('span.status-badge');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct label for mapped values', () => {
    const cases = [
      {
        value: AssessmentStatus.Remitted,
        label: 'Remitted',
      },
      {
        value: AssessmentStatus.InProgress,
        label: 'In Progress',
      },
      {
        value: AssessmentStatus.Finalized,
        label: 'Finalized',
      },
    ];

    for (const testCase of cases) {
      component.status = testCase.value;
      fixture.detectChanges();

      const pill = getStatusBadge();

      expect(pill.textContent?.trim()).toBe(testCase.label);
    }
  });

  it('should display the correct css class for mapped values', () => {
    const cases = [
      {
        value: AssessmentStatus.Remitted,
        cssClass: 'status-remitted',
      },
      {
        value: AssessmentStatus.InProgress,
        cssClass: 'status-in-progress',
      },
      {
        value: AssessmentStatus.Finalized,
        cssClass: 'status-finalized',
      },
    ];

    for (const testCase of cases) {
      component.status = testCase.value;
      fixture.detectChanges();

      const pill = getStatusBadge();
      expect(pill.classList.contains(testCase.cssClass)).toBeTrue();
    }
  });
});
