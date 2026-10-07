import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInformationComponent } from './account-information.component';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { of, throwError } from 'rxjs';
import { UserProfile } from '@core/models/user-profile.model';

const summaryProfile: UserProfile = {
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

describe('AccountInformationComponent', () => {
  let component: AccountInformationComponent;
  let fixture: ComponentFixture<AccountInformationComponent>;
  let userProfileServiceSpy: jasmine.SpyObj<UserProfileService>;

  beforeEach(async () => {
    userProfileServiceSpy = jasmine.createSpyObj<UserProfileService>(
      'UserProfileService',
      ['getMyProfile']
    );
    userProfileServiceSpy.getMyProfile.and.returnValue(of(summaryProfile));

    const userDataServiceSpy = jasmine.createSpyObj<UserDataService>(
      'UserDataService',
      ['user']
    );
    userDataServiceSpy.user.and.returnValue(null);

    const unsavedChangesGuardSpy =
      jasmine.createSpyObj<UnsavedChangesGuardService>(
        'UnsavedChangesGuardService',
        ['requestClose']
      );

    await TestBed.configureTestingModule({
      imports: [AccountInformationComponent],
      providers: [
        { provide: UserProfileService, useValue: userProfileServiceSpy },
        { provide: UserDataService, useValue: userDataServiceSpy },
        {
          provide: UnsavedChangesGuardService,
          useValue: unsavedChangesGuardSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in view mode', () => {
    expect(component.isEditing()).toBeFalse();
  });

  it('should switch to edit mode when the card emits "edit"', () => {
    const cardDebugElement = fixture.debugElement.query(
      el => el.name === 'app-profile-card'
    );
    cardDebugElement.triggerEventHandler('edit');

    expect(component.isEditing()).toBeTrue();
  });

  it('should switch back to view mode when the edit form emits "cancelled"', () => {
    component.startEdit();
    fixture.detectChanges();

    const editFormDebugElement = fixture.debugElement.query(
      el => el.name === 'app-profile-edit-form'
    );
    editFormDebugElement.triggerEventHandler('cancelled');

    expect(component.isEditing()).toBeFalse();
  });

  it('should switch back to view mode when the edit form emits "saved"', () => {
    component.startEdit();
    fixture.detectChanges();

    const editFormDebugElement = fixture.debugElement.query(
      el => el.name === 'app-profile-edit-form'
    );
    editFormDebugElement.triggerEventHandler('saved');

    expect(component.isEditing()).toBeFalse();
  });

  describe('summary panel', () => {
    it('should load the profile on init and hand it to the summary', () => {
      expect(userProfileServiceSpy.getMyProfile).toHaveBeenCalled();
      expect(component.summaryProfile()).toEqual(summaryProfile);
      expect(
        fixture.debugElement.query(el => el.name === 'app-profile-summary')
      ).toBeTruthy();
    });

    it('should refresh the summary after the profile is saved', () => {
      const updated = { ...summaryProfile, position: 'Dean' };
      userProfileServiceSpy.getMyProfile.and.returnValue(of(updated));
      const callsBefore = userProfileServiceSpy.getMyProfile.calls.count();

      component.startEdit();
      component.onSaved();

      expect(component.isEditing()).toBeFalse();
      expect(userProfileServiceSpy.getMyProfile.calls.count()).toBe(
        callsBefore + 1
      );
      expect(component.summaryProfile()?.position).toBe('Dean');
    });

    it('should not refresh the summary when the edition is cancelled', () => {
      const callsBefore = userProfileServiceSpy.getMyProfile.calls.count();

      component.startEdit();
      component.stopEdit();

      expect(userProfileServiceSpy.getMyProfile.calls.count()).toBe(
        callsBefore
      );
    });

    it('should keep the previous summary and not crash when it cannot be reloaded', () => {
      spyOn(console, 'error');
      userProfileServiceSpy.getMyProfile.and.returnValue(
        throwError(() => new Error('Error fetching user profile'))
      );

      component.onSaved();

      expect(component.summaryProfile()).toEqual(summaryProfile);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
