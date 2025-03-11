import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessFormComponent } from './evaluation-process-form.component';

describe('EvaluationProcessFormComponent', () => {
  let component: EvaluationProcessFormComponent;
  let fixture: ComponentFixture<EvaluationProcessFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationProcessFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationProcessFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
