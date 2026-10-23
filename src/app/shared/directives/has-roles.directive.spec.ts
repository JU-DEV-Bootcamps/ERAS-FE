import { Component, signal } from '@angular/core';
import { HasERASRolesDirective } from './has-roles.directive';
import { ERASRoles } from '@core/models/profile.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserDataService } from '@core/services/access/user-data.service';
import { Profile } from '@core/models/profile.model';

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

describe('HasERASRolesDirective reactivity', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  const user = signal<Profile | null>(null);

  const protectedElement = () =>
    fixture.debugElement.query(By.css('.protected-content'));

  beforeEach(async () => {
    user.set(null);
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: UserDataService, useValue: { user } }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.roles = [ERASRoles.ADMIN];
  });

  it('should render once the user profile loads after the first render', () => {
    fixture.detectChanges();
    expect(protectedElement()).toBeNull();

    user.set({ role: ERASRoles.ADMIN });
    fixture.detectChanges();

    expect(protectedElement()).not.toBeNull();
  });

  it('should remove the element when the user role stops matching', () => {
    user.set({ role: ERASRoles.ADMIN });
    fixture.detectChanges();
    expect(protectedElement()).not.toBeNull();

    user.set({ role: ERASRoles.PROFESSIONAL });
    fixture.detectChanges();

    expect(protectedElement()).toBeNull();
  });

  it('should re-evaluate when the required roles change', () => {
    user.set({ role: ERASRoles.OFFICER });
    fixture.detectChanges();
    expect(protectedElement()).toBeNull();

    hostComponent.roles = [ERASRoles.OFFICER];
    fixture.detectChanges();

    expect(protectedElement()).not.toBeNull();
  });

  it('should not recreate the view when nothing relevant changed', () => {
    user.set({ role: ERASRoles.ADMIN });
    fixture.detectChanges();
    const first = protectedElement().nativeElement;

    user.set({ role: ERASRoles.ADMIN, firstName: 'Updated' });
    fixture.detectChanges();

    expect(protectedElement().nativeElement).toBe(first);
  });
});
