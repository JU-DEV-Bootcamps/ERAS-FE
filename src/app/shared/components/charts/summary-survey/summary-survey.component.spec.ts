import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarySurveyComponent } from './summary-survey.component';

describe('SummarySurveyComponent', () => {
  let component: SummarySurveyComponent;
  let fixture: ComponentFixture<SummarySurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummarySurveyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummarySurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
