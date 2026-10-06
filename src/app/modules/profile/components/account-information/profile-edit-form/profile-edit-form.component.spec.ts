import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProfileEditFormComponent } from './profile-edit-form.component';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { UserProfile } from '@core/models/user-profile.model';

describe('ProfileEditFormComponent', () => {
  let component: ProfileEditFormComponent;
  let fixture: ComponentFixture<ProfileEditFormComponent>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;
  let mockUserDataService: jasmine.SpyObj<UserDataService>;
  let mockUnsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;

  const mockProfile: UserProfile = {
    firstName: 'Roberto',
    lastName: 'Alvarez',
    email: 'roberto.alvarez@jala.university',
    employeeId: '#EMP-2024-882',
    department: 'Design',
    phone: '+1 (555) 123-4567',
    role: 'Faculty Practitioner',
    about: 'Passionate educator with over 20 years of experience.',
  };

  beforeEach(async () => {
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', [
      'getMyProfile',
      'updateMyProfile',
    ]);
    mockUserProfileService.getMyProfile.and.returnValue(of(mockProfile));

    mockUserDataService = jasmine.createSpyObj<UserDataService>(
      'UserDataService',
      ['user']
    );
    mockUserDataService.user.and.returnValue({ id: 'user-1' });

    mockUnsavedChangesGuard = jasmine.createSpyObj<UnsavedChangesGuardService>(
      'UnsavedChangesGuardService',
      ['requestClose']
    );

    await TestBed.configureTestingModule({
      imports: [ProfileEditFormComponent],
      providers: [
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: UserDataService, useValue: mockUserDataService },
        {
          provide: UnsavedChangesGuardService,
          useValue: mockUnsavedChangesGuard,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the profile on init and populate the form', () => {
    fixture.detectChanges();

    expect(component.profile).toEqual(mockProfile);
    expect(component.form.getRawValue()).toEqual({
      employeeId: mockProfile.employeeId,
      department: mockProfile.department,
      phone: mockProfile.phone,
      about: mockProfile.about,
    });
  });

  it('should set hasError when the request fails', () => {
    mockUserProfileService.getMyProfile.and.returnValue(
      throwError(() => new Error('Error fetching user profile'))
    );
    fixture.detectChanges();

    expect(component.hasError).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  describe('hasUnsavedChanges', () => {
    it('should be false right after the profile loads', () => {
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('should be true once a field is edited', () => {
      fixture.detectChanges();

      component.form.controls['phone'].setValue('+1 (555) 999-9999');

      expect(component.hasUnsavedChanges()).toBeTrue();
    });
  });

  describe('save', () => {
    it('should PUT the form value for the current user id and emit "saved"', () => {
      fixture.detectChanges();
      const updatedProfile = { ...mockProfile, phone: '+1 (555) 999-9999' };
      mockUserProfileService.updateMyProfile.and.returnValue(
        of(updatedProfile)
      );
      const savedSpy = jasmine.createSpy('saved');
      component.saved.subscribe(savedSpy);

      component.form.controls['phone'].setValue('+1 (555) 999-9999');
      component.save();

      expect(mockUserProfileService.updateMyProfile).toHaveBeenCalledWith(
        'user-1',
        component.form.getRawValue()
      );
      expect(savedSpy).toHaveBeenCalledWith(updatedProfile);
    });

    it('should not call the API when the form is invalid', () => {
      fixture.detectChanges();
      component.form.controls['department'].setValue('');

      component.save();

      expect(mockUserProfileService.updateMyProfile).not.toHaveBeenCalled();
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
