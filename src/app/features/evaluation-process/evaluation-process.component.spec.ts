import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessComponent } from './evaluation-process.component';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('EvaluationProcessComponent', () => {
  let component: EvaluationProcessComponent;
  let fixture: ComponentFixture<EvaluationProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationProcessComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
