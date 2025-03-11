import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessComponent } from './evaluation-process.component';

describe('EvaluationProcessComponent', () => {
  let component: EvaluationProcessComponent;
  let fixture: ComponentFixture<EvaluationProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
