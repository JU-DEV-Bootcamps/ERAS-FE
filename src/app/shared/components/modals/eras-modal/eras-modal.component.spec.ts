import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErasModalComponent } from './eras-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnvironmentInjector } from '@angular/core';

describe('ErasModalComponent', () => {
  let component: ErasModalComponent;
  let fixture: ComponentFixture<ErasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErasModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: EnvironmentInjector, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
