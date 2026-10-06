import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInformationComponent } from './account-information.component';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { of } from 'rxjs';

describe('AccountInformationComponent', () => {
  let component: AccountInformationComponent;
  let fixture: ComponentFixture<AccountInformationComponent>;

  beforeEach(async () => {
    const userProfileServiceSpy = jasmine.createSpyObj('UserProfileService', [
      'getMyProfile',
    ]);
    userProfileServiceSpy.getMyProfile.and.returnValue(of(null));

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
});
