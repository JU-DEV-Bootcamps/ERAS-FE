import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { ActivatedRoute } from '@angular/router';
import { RecentAlertsListComponent } from './recent-alerts-list.component';
import {
  STATUS_COLORS,
  STATUS_EVALUATIONS,
  STATUS_LABEL_COLORS,
} from '@core/constants/StatusEvaluation';
import {
  ALERT_RISK_COLORS,
  ALERT_RISK_LABEL_COLORS,
} from '@core/constants/alertRiskLevel';

describe('RecentAlertsListComponent', () => {
  let component: RecentAlertsListComponent;
  let fixture: ComponentFixture<RecentAlertsListComponent>;
  let mockService: jasmine.SpyObj<EvaluationDetailsService>;

  const knownStatus = Object.keys(STATUS_EVALUATIONS).find(
    k => k !== 'default'
  )!;
  const knownRiskLevel = Object.keys(ALERT_RISK_COLORS).find(
    k => k !== 'default'
  )!;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('EvaluationDetailsService', [
      'getRecentAlerts',
    ]);

    await TestBed.configureTestingModule({
      imports: [RecentAlertsListComponent],
      providers: [
        { provide: EvaluationDetailsService, useValue: mockService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentAlertsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter columns correctly', () => {
    const cols = component.columns;
    expect(cols.every(c => !c.isTemplate)).toBeTrue();
  });

  it('should filter columnTemplates correctly', () => {
    const templates = component.columnTemplates;
    expect(templates.every(c => c.isTemplate)).toBeTrue();
  });

  it('should call service and update data on handleLoadCalled', () => {
    const mockResponse = {
      items: [
        {
          studentId: '1',
          studentName: 'A',
          riskLevel: 'High',
          category: 'Any',
          date: new Date(),
          status: 'Base',
        },
      ],
      count: 1,
    };

    const mockEvent = {
      page: 2,
      pageSize: 10,
    };
    mockService.getRecentAlerts.and.returnValue(of(mockResponse));

    component.handleLoadCalled(mockEvent);

    expect(component.isLoading).toBeFalse();
    expect(mockService.getRecentAlerts).toHaveBeenCalledWith(
      component.pagination
    );
    expect(component.alertsList).toEqual(mockResponse.items);
    expect(component.totalAlerts).toBe(1);
  });

  describe('getStatusLabel', () => {
    it('should return mapped label when status is known (branch true)', () => {
      expect(component.getStatusLabel(knownStatus)).toBe(
        STATUS_EVALUATIONS[knownStatus]
      );
    });

    it('should return default status label if not found (branch false)', () => {
      expect(component.getStatusLabel('UNKNOWN_STATUS')).toBe(
        STATUS_EVALUATIONS['default']
      );
    });
  });

  describe('getStatusColor', () => {
    it('should return mapped color when status is known (branch true)', () => {
      expect(component.getStatusColor(knownStatus)).toBe(
        STATUS_COLORS[knownStatus]
      );
    });

    it('should return default status color if not found (branch false)', () => {
      expect(component.getStatusColor('UNKNOWN_STATUS')).toBe(
        STATUS_COLORS['default']
      );
    });
  });

  describe('getStatusLabelColor', () => {
    it('should return mapped label color when status is known (branch true)', () => {
      expect(component.getStatusLabelColor(knownStatus)).toBe(
        STATUS_LABEL_COLORS[knownStatus]
      );
    });

    it('should return default status label color if not found (branch false)', () => {
      expect(component.getStatusLabelColor('UNKNOWN_STATUS')).toBe(
        STATUS_LABEL_COLORS['default']
      );
    });
  });

  describe('getRiskLevelColor', () => {
    it('should return mapped color when risk level is known (branch true)', () => {
      expect(component.getRiskLevelColor(knownRiskLevel)).toBe(
        ALERT_RISK_COLORS[knownRiskLevel]
      );
    });

    it('should return default risk level color if not found (branch false)', () => {
      expect(component.getRiskLevelColor('UNKNOWN_LEVEL')).toBe(
        ALERT_RISK_COLORS['default']
      );
    });
  });

  describe('getRiskLevelLabelColor', () => {
    it('should return mapped label color when risk level is known (branch true)', () => {
      expect(component.getRiskLevelLabelColor(knownRiskLevel)).toBe(
        ALERT_RISK_LABEL_COLORS[knownRiskLevel]
      );
    });

    it('should return default risk level label color if not found (branch false)', () => {
      expect(component.getRiskLevelLabelColor('UNKNOWN_LEVEL')).toBe(
        ALERT_RISK_LABEL_COLORS['default']
      );
    });
  });
});
