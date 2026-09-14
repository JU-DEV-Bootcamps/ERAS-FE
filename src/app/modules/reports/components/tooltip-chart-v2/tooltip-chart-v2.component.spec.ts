import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipChartV2Component } from './tooltip-chart-v2.component';
import { RISK_COLORS } from '@core/constants/riskLevel';
import { AnswerDetail } from '@core/models/summary.model';

describe('TooltipChartV2Component', () => {
  let component: TooltipChartV2Component;
  let fixture: ComponentFixture<TooltipChartV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipChartV2Component],
    })
      .overrideComponent(TooltipChartV2Component, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TooltipChartV2Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize answersWithColor as empty array if answers input is undefined', () => {
    component.answers = undefined;
    component.ngOnInit();

    expect(component.answersWithColor).toEqual([]);
  });

  it('should map answers with correct colors and unique studentCount on ngOnInit', () => {
    const mockAnswers: AnswerDetail[] = [
      {
        answerText: 'High risk answer',
        riskLevel: 3,
        studentsEmails: ['user1@test.com', 'user2@test.com', 'user1@test.com'],
      } as unknown as AnswerDetail,
      {
        answerText: 'Low risk answer',
        riskLevel: 1,
        studentsEmails: ['user3@test.com'],
      } as unknown as AnswerDetail,
    ];

    component.answers = mockAnswers;
    component.ngOnInit();

    expect(component.answersWithColor.length).toBe(2);

    expect(component.answersWithColor[0].riskColor).toBe(RISK_COLORS[3]);
    expect(component.answersWithColor[0].studentCount).toBe(2);
    expect(component.answersWithColor[0].answerText).toBe('High risk answer');

    expect(component.answersWithColor[1].riskColor).toBe(RISK_COLORS[1]);
    expect(component.answersWithColor[1].studentCount).toBe(1);
    expect(component.answersWithColor[1].answerText).toBe('Low risk answer');
  });

  it('should use fallbacks when riskLevel or studentsEmails are missing', () => {
    const mockAnswers: AnswerDetail[] = [
      {
        answerText: 'Incomplete answer',
        riskLevel: undefined,
        studentsEmails: undefined,
      } as unknown as AnswerDetail,
    ];

    component.answers = mockAnswers;
    component.ngOnInit();

    expect(component.answersWithColor.length).toBe(1);
    expect(component.answersWithColor[0].riskColor).toBe(RISK_COLORS[0]);
    expect(component.answersWithColor[0].studentCount).toBe(0);
  });

  it('should receive inputs correctly', () => {
    component.value = 'Students: 5';
    component.category = 'Ansiedad';
    component.emails = ['a@test.com', 'b@test.com'];

    expect(component.value).toBe('Students: 5');
    expect(component.category).toBe('Ansiedad');
    expect(component.emails).toEqual(['a@test.com', 'b@test.com']);
  });
});
