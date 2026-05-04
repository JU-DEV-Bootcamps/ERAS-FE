import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAssessmentModalComponent } from './new-assessment-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('NewAssessmentModalComponent', () => {
  let component: NewAssessmentModalComponent;
  let fixture: ComponentFixture<NewAssessmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAssessmentModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
