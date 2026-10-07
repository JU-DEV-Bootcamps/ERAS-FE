import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProfessionalInfoEditFormComponent } from './professional-info-edit-form.component';
import { ProfessionalProfile } from '@core/models/professional-profile.model';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { ProfessionalProfileStore } from '@core/store/professional-profile.store';

describe('ProfessionalInfoEditFormComponent', () => {
  let component: ProfessionalInfoEditFormComponent;
  let fixture: ComponentFixture<ProfessionalInfoEditFormComponent>;
  let mockUnsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;
  let store: InstanceType<typeof ProfessionalProfileStore>;

  const mockProfile: ProfessionalProfile = {
    position: 'Professor of Computer Science',
    faculty: 'Faculty of Engineering',
    officeHours: 'Mon/Wed 2:00 PM - 4:00 PM',
    activeEvaluations: '4 Ongoing',
    subjectsTaught: ['Introduction to UIUX', 'Advanced Algorithms'],
    courses: [{ code: 'CS401', name: 'Neural Network Architectures' }],
  };

  beforeEach(async () => {
    mockUnsavedChangesGuard = jasmine.createSpyObj<UnsavedChangesGuardService>(
      'UnsavedChangesGuardService',
      ['requestClose']
    );

    await TestBed.configureTestingModule({
      imports: [ProfessionalInfoEditFormComponent],
      providers: [
        {
          provide: UnsavedChangesGuardService,
          useValue: mockUnsavedChangesGuard,
        },
      ],
    }).compileComponents();

    store = TestBed.inject(ProfessionalProfileStore);
    store.setProfessionalProfile(mockProfile);

    fixture = TestBed.createComponent(ProfessionalInfoEditFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should populate the form with the current store values', () => {
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      position: mockProfile.position,
      faculty: mockProfile.faculty,
      officeHours: mockProfile.officeHours,
      activeEvaluations: mockProfile.activeEvaluations,
      subjectsTaught: mockProfile.subjectsTaught.join(', '),
      courses: 'CS401 - Neural Network Architectures',
    });
  });

  describe('hasUnsavedChanges', () => {
    it('should be false right after the form loads', () => {
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('should be true once a field is edited', () => {
      fixture.detectChanges();

      component.form.controls['position'].setValue('Associate Professor');

      expect(component.hasUnsavedChanges()).toBeTrue();
    });
  });

  describe('save', () => {
    it('should update the store with the parsed form value and emit "saved"', () => {
      fixture.detectChanges();
      const savedSpy = jasmine.createSpy('saved');
      component.saved.subscribe(savedSpy);

      component.form.controls['position'].setValue('Associate Professor');
      component.form.controls['subjectsTaught'].setValue(
        'Machine Learning, Statistics'
      );
      component.form.controls['courses'].setValue(
        'CS401 - Neural Network Architectures\nCS502 - Advanced ML Seminar'
      );

      component.save();

      expect(store.profile()).toEqual({
        ...mockProfile,
        position: 'Associate Professor',
        subjectsTaught: ['Machine Learning', 'Statistics'],
        courses: [
          { code: 'CS401', name: 'Neural Network Architectures' },
          { code: 'CS502', name: 'Advanced ML Seminar' },
        ],
      });
      expect(savedSpy).toHaveBeenCalled();
    });

    it('should not update the store when the form is invalid', () => {
      fixture.detectChanges();
      component.form.controls['position'].setValue('');

      component.save();

      expect(store.profile()).toEqual(mockProfile);
    });
  });

  describe('cancel', () => {
    it('should emit "cancelled" when there are no unsaved changes to confirm', () => {
      fixture.detectChanges();
      mockUnsavedChangesGuard.requestClose.and.returnValue(of(true));
      const cancelledSpy = jasmine.createSpy('cancelled');
      component.cancelled.subscribe(cancelledSpy);

      component.cancel();

      expect(mockUnsavedChangesGuard.requestClose).toHaveBeenCalled();
      expect(cancelledSpy).toHaveBeenCalled();
    });

    it('should NOT emit "cancelled" when the user chooses to keep editing', () => {
      fixture.detectChanges();
      mockUnsavedChangesGuard.requestClose.and.returnValue(of(false));
      const cancelledSpy = jasmine.createSpy('cancelled');
      component.cancelled.subscribe(cancelledSpy);

      component.cancel();

      expect(cancelledSpy).not.toHaveBeenCalled();
    });
  });
});
