import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessFormComponent } from './evaluation-process-form.component';
import { of } from 'rxjs';
import { CosmicLatteService } from '../../../core/services/cosmic-latte.service';
import { EvaluationProcessService } from '../../../core/services/evaluation-process.service';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('EvaluationProcessFormComponent', () => {
  let component: EvaluationProcessFormComponent;
  let fixture: ComponentFixture<EvaluationProcessFormComponent>;
  const mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
    'getPollNames',
  ]);
  const mockEvaluationService = jasmine.createSpyObj(
    'EvaluationProcessService',
    ['createEvalProc']
  );

  beforeEach(async () => {
    mockCosmicLatteService.getPollNames.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [EvaluationProcessFormComponent],
      providers: [
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
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

    fixture = TestBed.createComponent(EvaluationProcessFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
