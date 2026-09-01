import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ModalImportAnswersFormComponent } from './modal-import-answers-form.component';
import { HttpClientModule } from '@angular/common/http';
import { UserDataService } from '@core/services/access/user-data.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

describe('ModalImportAnswersFormComponent', () => {
  let component: ModalImportAnswersFormComponent;
  let fixture: ComponentFixture<ModalImportAnswersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ModalImportAnswersFormComponent,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
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
          useValue: {
            close: jasmine.createSpy('close'),
            backdropClick: jasmine
              .createSpy('backdropClick')
              .and.returnValue(of(new MouseEvent('click'))),
            keydownEvents: jasmine
              .createSpy('keydownEvents')
              .and.returnValue(of(new KeyboardEvent('keydown'))),
          },
        },
        {
          provide: UnsavedChangesGuardService,
          useValue: {
            attach: jasmine.createSpy('attach'),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalImportAnswersFormComponent);
    component = fixture.componentInstance;

    component['preselectedPollState'] = {
      pollName: 'Test Poll',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
