import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteConfirmationComponent } from './modal-delete-confirmation.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ModalDeleteConfirmationComponent', () => {
  let component: ModalDeleteConfirmationComponent;
  let fixture: ComponentFixture<ModalDeleteConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDeleteConfirmationComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalDeleteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
