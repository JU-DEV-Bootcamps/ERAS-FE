import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfile } from '@core/models/user-profile.model';
import { ProfileSummaryComponent } from './profile-summary.component';

describe('ProfileSummaryComponent', () => {
  let fixture: ComponentFixture<ProfileSummaryComponent>;
  let component: ProfileSummaryComponent;

  const profile: UserProfile = {
    firstName: 'Roberto',
    lastName: 'Alvarez',
    email: 'roberto.alvarez@jala.university',
    employeeId: '#EMP-2024-882',
    department: 'Design',
    position: 'Professor of Computer Science',
    phone: '+1 (555) 123-4567',
    role: 'ERAS Administrator',
    about: 'Bio',
    activeAssessmentsCount: 4,
    activeInterventionsCount: 7,
  };

  const tileText = (key: string): string =>
    fixture.nativeElement
      .querySelector(`[data-testid="${key}"]`)
      ?.textContent.replace(/\s+/g, ' ')
      .trim() ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should render nothing until a profile is provided', () => {
    fixture.detectChanges();

    expect(component.tiles()).toEqual([]);
    expect(fixture.nativeElement.querySelector('.tiles')).toBeNull();
  });

  it('should show the position and the active assessments and interventions', () => {
    fixture.componentRef.setInput('profile', profile);
    fixture.detectChanges();

    expect(tileText('position')).toContain('Professor of Computer Science');
    expect(tileText('active-assessments')).toContain('4 Ongoing');
    expect(tileText('active-interventions')).toContain('7 Ongoing');
  });

  it('should show zero when the counters are missing', () => {
    fixture.componentRef.setInput('profile', {
      ...profile,
      activeAssessmentsCount: undefined,
      activeInterventionsCount: undefined,
    });
    fixture.detectChanges();

    expect(tileText('active-assessments')).toContain('0 Ongoing');
    expect(tileText('active-interventions')).toContain('0 Ongoing');
  });

  it('should show a dash when the position was never filled in', () => {
    fixture.componentRef.setInput('profile', { ...profile, position: '  ' });
    fixture.detectChanges();

    expect(tileText('position')).toContain('—');
  });
});
