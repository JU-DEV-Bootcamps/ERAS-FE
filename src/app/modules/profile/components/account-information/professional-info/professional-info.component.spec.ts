import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProfessionalInfoComponent } from './professional-info.component';
import { ProfessionalProfile } from '@core/models/professional-profile.model';
import { ProfessionalProfileService } from '@core/services/api/professional-profile.service';

const savedProfile: ProfessionalProfile = {
  position: 'Professor of Computer Science',
  faculty: 'Engineering',
  officeHours: 'Mon 9:00-11:00',
  subjectsTaught: ['Algorithms', 'Databases'],
  courses: [{ code: 'CS101', name: 'Intro to Programming' }],
};

describe('ProfessionalInfoComponent', () => {
  let component: ProfessionalInfoComponent;
  let fixture: ComponentFixture<ProfessionalInfoComponent>;
  let professionalProfileServiceSpy: jasmine.SpyObj<ProfessionalProfileService>;

  beforeEach(async () => {
    professionalProfileServiceSpy =
      jasmine.createSpyObj<ProfessionalProfileService>(
        'ProfessionalProfileService',
        ['getMyProfessionalProfile', 'updateMyProfessionalProfile']
      );
    professionalProfileServiceSpy.getMyProfessionalProfile.and.returnValue(
      of(savedProfile)
    );

    await TestBed.configureTestingModule({
      imports: [ProfessionalInfoComponent],
      providers: [
        {
          provide: ProfessionalProfileService,
          useValue: professionalProfileServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('[603-persist-professional-profile/AC-12] shows faculty and office hours returned by the backend', () => {
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Engineering');
    expect(text).toContain('Mon 9:00-11:00');
  });

  it('[603-persist-professional-profile/AC-19] shows active interventions read-only', () => {
    fixture.componentRef.setInput('activeInterventions', 7);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Active Interventions');
    expect(text).toContain('7');
    expect(fixture.nativeElement.querySelector('input, textarea')).toBeNull();
  });

  it('should render a chip for every subject taught', () => {
    const chips: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('.chip');

    expect(chips.length).toBe(savedProfile.subjectsTaught.length);
  });

  it('should render a row for every course currently taught', () => {
    const rows: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('.courses-table tbody tr');

    expect(rows.length).toBe(savedProfile.courses.length);
  });

  describe('edit button', () => {
    it('should emit "edit" when clicked', () => {
      const editSpy = jasmine.createSpy('edit');
      component.edit.subscribe(editSpy);

      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector('.edit-button');
      button.click();

      expect(editSpy).toHaveBeenCalled();
    });
  });
});
