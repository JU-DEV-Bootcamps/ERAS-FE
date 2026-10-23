import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteConfirmationComponent } from './modal-delete-confirmation.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ModalDeleteConfirmationComponent', () => {
  let component: ModalDeleteConfirmationComponent;
  let fixture: ComponentFixture<ModalDeleteConfirmationComponent>;
  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDeleteConfirmationComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalDeleteConfirmationComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with true on confirm', () => {
    component.onConfirm();

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false on cancel', () => {
    component.onCancel();

    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
