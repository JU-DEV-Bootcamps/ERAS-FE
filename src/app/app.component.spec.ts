import { TestBed } from '@angular/core/testing';
import { UserDataService } from '@core/services/access/user-data.service';
import { AppComponent } from './app.component';
import keycloak from 'keycloak-js';

describe('AppComponent', () => {
  let userDataServiceSpy: jasmine.SpyObj<UserDataService>;
  let keycloakMock: jasmine.SpyObj<unknown>;

  beforeEach(async () => {
    keycloakMock = jasmine.createSpyObj('keycloak', ['loadUserProfile']);
    userDataServiceSpy = jasmine.createSpyObj('UserDataService', ['initUser']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: keycloak, useValue: keycloakMock },
        { provide: UserDataService, useValue: userDataServiceSpy },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
