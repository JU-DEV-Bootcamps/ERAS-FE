import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessListComponent } from './evaluation-process-list.component';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { EvaluationsService } from '../../../../core/services/api/evaluations.service';
import { ActivatedRoute } from '@angular/router';

describe('EvaluationProcessListComponent', () => {
  let component: EvaluationProcessListComponent;
  let fixture: ComponentFixture<EvaluationProcessListComponent>;

  const mockEvaluationService = jasmine.createSpyObj(
    'EvaluationProcessService',
    ['createEvalProc', 'getAllEvalProc']
  );
  mockEvaluationService.getAllEvalProc.and.returnValue(
    of({ items: [], count: 0 })
  );

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
    params: of({}),
    queryParams: of({}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationProcessListComponent],
      providers: [
        { provide: EvaluationsService, useValue: mockEvaluationService },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
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
