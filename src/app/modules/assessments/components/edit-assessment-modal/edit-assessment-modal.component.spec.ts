import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssessmentModalComponent } from './edit-assessment-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

const dialogData = {
  assessment: {},
  profiles: [],
  services: [],
  professionals: [],
  students: [],
};

describe('EditAssessmentModalComponent', () => {
  let component: EditAssessmentModalComponent;
  let fixture: ComponentFixture<EditAssessmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssessmentModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
