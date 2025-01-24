import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component'
import { Router } from '@angular/router'
describe('LoginComponent', ()=> {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let router: Router;

    // Set up the test environment
    beforeEach(async () => {
        // Create a spy object for the Router to mock its behavior
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        // Configure the TestBed with the LoginComponent and mock providers
        await TestBed.configureTestingModule({
            imports:[LoginComponent],
            providers: [
              { provide: Router, useValue: routerSpy },
              {
                provide: 'SocialAuthServiceConfig',
                useValue: {
                  autoLogin: false,
                  providers: [],
                  onError: (err: any) => console.error(err)
                }
              }
            ]
          })
        .compileComponents();
        // Create the component and inject dependencies
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
    });

    it('should navigate to /profile if user is in localStorage', () => {
        // Mock the localStorage.getItem method to return a mock user
        spyOn(localStorage, 'getItem').and.returnValue('mockUser');
        // Call ngOnInit() to trigger the logic that checks localStorage
        component.ngOnInit();
        // Verify that the router's navigate method was called with the '/profile' route
        expect(router.navigate).toHaveBeenCalledWith(['/profile']);
      });

    it('should create login button', () => {
        // Check if the component instance is created
        expect(component).toBeTruthy();
    });
})