import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterventionPillBadgeComponent } from './intervention-pill-badge.component';
import {
  InterventionMode,
  InterventionStatus,
  InterventionType,
} from '@core/models/assessment.model';

describe('InterventionPillBadgeComponent', () => {
  let component: InterventionPillBadgeComponent;
  let fixture: ComponentFixture<InterventionPillBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionPillBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionPillBadgeComponent);
    component = fixture.componentInstance;
  });

  function getPill(): HTMLSpanElement {
    return fixture.nativeElement.querySelector('span.pill');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct label for mapped values', () => {
    const cases = [
      {
        value: InterventionType.Individual,
        label: 'Individual',
      },
      {
        value: InterventionType.Group,
        label: 'Group',
      },
      {
        value: InterventionMode.InPlace,
        label: 'In-Place',
      },
      {
        value: InterventionMode.Remote,
        label: 'Remote',
      },
      {
        value: InterventionStatus.Remitted,
        label: 'Remitted',
      },
      {
        value: InterventionStatus.InProgress,
        label: 'In Progress',
      },
      {
        value: InterventionStatus.Finalized,
        label: 'Finalized',
      },
    ];

    for (const testCase of cases) {
      component.value = testCase.value;
      fixture.detectChanges();

      const pill = getPill();

      expect(pill.textContent?.trim()).toBe(testCase.label);
    }
  });

  it('should display the correct css class for mapped values', () => {
    const cases = [
      {
        value: InterventionType.Individual,
        cssClass: 'type-individual',
      },
      {
        value: InterventionType.Group,
        cssClass: 'type-group',
      },
      {
        value: InterventionMode.InPlace,
        cssClass: 'mode-inplace',
      },
      {
        value: InterventionMode.Remote,
        cssClass: 'mode-remote',
      },
      {
        value: InterventionStatus.Remitted,
        cssClass: 'status-remitted',
      },
      {
        value: InterventionStatus.InProgress,
        cssClass: 'status-in-progress',
      },
      {
        value: InterventionStatus.Finalized,
        cssClass: 'status-finalized',
      },
    ];

    for (const testCase of cases) {
      component.value = testCase.value;
      fixture.detectChanges();

      const pill = getPill();
      expect(pill.classList.contains(testCase.cssClass)).toBeTrue();
    }
  });
});
