import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProfessionalProfileService } from '@core/services/api/professional-profile.service';

import { ProfessionalInfoEditFormComponent } from './professional-info-edit-form.component';
import { ProfessionalProfile } from '@core/models/professional-profile.model';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { ProfessionalProfileStore } from '@core/store/professional-profile.store';

describe('ProfessionalInfoEditFormComponent', () => {
  let component: ProfessionalInfoEditFormComponent;
  let fixture: ComponentFixture<ProfessionalInfoEditFormComponent>;
  let mockUnsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;
  let store: InstanceType<typeof ProfessionalProfileStore>;
  let professionalProfileServiceSpy: jasmine.SpyObj<ProfessionalProfileService>;

  const mockProfile: ProfessionalProfile = {
    position: 'Professor of Computer Science',
    faculty: 'Faculty of Engineering',
    officeHours: 'Mon/Wed 2:00 PM - 4:00 PM',
    subjectsTaught: ['Introduction to UIUX', 'Advanced Algorithms'],
    courses: [{ code: 'CS401', name: 'Neural Network Architectures' }],
  };

  beforeEach(async () => {
    professionalProfileServiceSpy =
      jasmine.createSpyObj<ProfessionalProfileService>(
        'ProfessionalProfileService',
        ['getMyProfessionalProfile', 'updateMyProfessionalProfile']
      );
    professionalProfileServiceSpy.updateMyProfessionalProfile.and.returnValue(
      of(mockProfile)
    );

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
        {
          provide: ProfessionalProfileService,
          useValue: professionalProfileServiceSpy,
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
      professionalProfileServiceSpy.updateMyProfessionalProfile.and.returnValue(
        of({
          ...mockProfile,
          position: 'Associate Professor',
          subjectsTaught: ['Machine Learning', 'Statistics'],
          courses: [
            { code: 'CS401', name: 'Neural Network Architectures' },
            { code: 'CS502', name: 'Advanced ML Seminar' },
          ],
        })
      );
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

  it('[603-persist-professional-profile/AC-13] returns to view mode showing the saved faculty', () => {
    fixture.detectChanges();
    professionalProfileServiceSpy.updateMyProfessionalProfile.and.returnValue(
      of({ ...mockProfile, faculty: 'Science' })
    );
    const savedSpy = jasmine.createSpy('saved');
    component.saved.subscribe(savedSpy);
    component.form.controls['faculty'].setValue('Science');

    component.save();

    expect(
      professionalProfileServiceSpy.updateMyProfessionalProfile
    ).toHaveBeenCalledWith(jasmine.objectContaining({ faculty: 'Science' }));
    expect(store.profile().faculty).toBe('Science');
    expect(savedSpy).toHaveBeenCalled();
  });

  it('[603-persist-professional-profile/AC-14] shows an error and keeps the form open when the save fails', () => {
    fixture.detectChanges();
    professionalProfileServiceSpy.updateMyProfessionalProfile.and.returnValue(
      throwError(() => new Error('save failed'))
    );
    const savedSpy = jasmine.createSpy('saved');
    component.saved.subscribe(savedSpy);
    component.form.controls['faculty'].setValue('Science');

    component.save();
    fixture.detectChanges();

    const error: HTMLElement | null =
      fixture.nativeElement.querySelector('.error-message');
    expect(error?.textContent).toContain('could not be saved');
    expect(savedSpy).not.toHaveBeenCalled();
    expect(component.form.controls['faculty'].value).toBe('Science');
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
