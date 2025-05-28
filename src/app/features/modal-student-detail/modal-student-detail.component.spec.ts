import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStudentDetailComponent } from './modal-student-detail.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ModalStudentDetailComponent', () => {
  let component: ModalStudentDetailComponent;
  let fixture: ComponentFixture<ModalStudentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalStudentDetailComponent],
      providers: [
        provideAnimations(),
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            studentId: 1,
          },
        },
        { provide: ActivatedRoute, useValue: {} },

        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalStudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
