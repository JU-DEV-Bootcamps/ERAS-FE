import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UserDataService } from '@core/services/access/user-data.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let userDataServiceSpy: jasmine.SpyObj<UserDataService>;

  beforeEach(async () => {
    userDataServiceSpy = jasmine.createSpyObj('UserDataService', ['initUser']);
    userDataServiceSpy.initUser.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: UserDataService, useValue: userDataServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the title "ERAS"', () => {
    expect(component.title).toBe('ERAS');
  });

  it('should call userData.initUser() on ngOnInit', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(userDataServiceSpy.initUser).toHaveBeenCalledTimes(1);
  }));

  it('should await initUser before completing ngOnInit', fakeAsync(() => {
    let resolved = false;
    userDataServiceSpy.initUser.and.returnValue(
      new Promise<void>(resolve =>
        setTimeout(() => {
          resolved = true;
          resolve();
        }, 100)
      )
    );

    component.ngOnInit();
    expect(resolved).toBeFalse();

    tick(100);
    expect(resolved).toBeTrue();
  }));
});
