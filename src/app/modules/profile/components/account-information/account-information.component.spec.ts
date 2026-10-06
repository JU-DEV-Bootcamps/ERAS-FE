import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInformationComponent } from './account-information.component';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { UserDataService } from '@core/services/access/user-data.service';
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

    await TestBed.configureTestingModule({
      imports: [AccountInformationComponent],
      providers: [
        { provide: UserProfileService, useValue: userProfileServiceSpy },
        { provide: UserDataService, useValue: userDataServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
