import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentsComponent } from './assessments.component';
import { provideHttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

describe('AssessmentsComponent', () => {
  let component: AssessmentsComponent;
  let fixture: ComponentFixture<AssessmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentsComponent],
      providers: [
        { provide: Keycloak, useValue: keycloakMock },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
