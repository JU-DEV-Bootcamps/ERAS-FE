import { Component } from '@angular/core';
import { HasERASRolesDirective } from './has-roles.directive';
import { ERASRoles } from '@core/models/profile.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserDataService } from '@core/services/access/user-data.service';

@Component({
  standalone: true,
  imports: [HasERASRolesDirective],
  template: `
    <div *appHasERASRoles="roles" class="protected-content">
      Protected Content
    </div>
  `,
})
class TestHostComponent {
  roles: ERASRoles[] = [];
}

describe('HasERASRolesDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let mockUserDataService: jasmine.SpyObj<UserDataService>;

  function getProtectedElement() {
    return fixture.debugElement.query(By.css('.protected-content'));
  }

  beforeEach(async () => {
    mockUserDataService = jasmine.createSpyObj('UserDataService', ['user']);
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: UserDataService, useValue: mockUserDataService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
  });

  it('should create an instance', () => {
    fixture.detectChanges();
    expect(hostComponent).toBeTruthy();
  });

  it('should not render the element when user has no role (null user)', () => {
    mockUserDataService.user.and.returnValue(null);

    fixture.detectChanges();

    expect(getProtectedElement()).toBeNull();
  });

  it('should not render the element when required roles list is empty', () => {
    mockUserDataService.user.and.returnValue({ role: ERASRoles.ADMIN });
    hostComponent.roles = [];

    fixture.detectChanges();

    expect(getProtectedElement()).toBeNull();
  });

  it('should render the element when user role is included in required roles', () => {
    mockUserDataService.user.and.returnValue({ role: ERASRoles.ADMIN });
    hostComponent.roles = [ERASRoles.ADMIN, ERASRoles.OFFICER];

    fixture.detectChanges();

    expect(getProtectedElement()).not.toBeNull();
    expect(getProtectedElement().nativeElement.textContent).toContain(
      'Protected Content'
    );
  });

  it('should not render the element when user role is not included in required roles', () => {
    mockUserDataService.user.and.returnValue({ role: ERASRoles.PROFESSIONAL });
    hostComponent.roles = [ERASRoles.ADMIN, ERASRoles.OFFICER];

    fixture.detectChanges();

    expect(getProtectedElement()).toBeNull();
  });

  it('should render the element on initial render if role matches from the start', () => {
    mockUserDataService.user.and.returnValue({ role: ERASRoles.PROFESSIONAL });
    hostComponent.roles = [ERASRoles.PROFESSIONAL];

    fixture.detectChanges();

    expect(getProtectedElement()).not.toBeNull();
  });
});
