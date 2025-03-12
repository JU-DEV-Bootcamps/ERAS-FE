import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessListComponent } from './evaluation-process-list.component';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EvaluationProcessService } from '../../../core/services/evaluation-process.service';

describe('EvaluationProcessListComponent', () => {
  let component: EvaluationProcessListComponent;
  let fixture: ComponentFixture<EvaluationProcessListComponent>;
  const mockEvaluationService = jasmine.createSpyObj(
    'EvaluationProcessService',
    ['createEvalProc']
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationProcessListComponent],
      providers: [
        { provide: EvaluationProcessService, useValue: mockEvaluationService },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationProcessListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
