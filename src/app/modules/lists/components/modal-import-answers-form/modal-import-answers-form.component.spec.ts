import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImportAnswersFormComponent } from './modal-import-answers-form.component';
import { HttpClientModule } from '@angular/common/http';
import { UserDataService } from '@core/services/access/user-data.service';
import Keycloak from 'keycloak-js';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

describe('ModalImportAnswersFormComponent', () => {
  let component: ModalImportAnswersFormComponent;
  let fixture: ComponentFixture<ModalImportAnswersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImportAnswersFormComponent, HttpClientModule],
      providers: [
        {
          provide: UserDataService,
          useValue: {
            user: () => ({ id: '123', name: 'Test User' }),
          },
        },
        { provide: Keycloak, useValue: keycloakMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalImportAnswersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
