import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { ActivatedRoute } from '@angular/router';
import { RecentAlertsListComponent } from './recent-alerts-list.component';

describe('RecentAlertsListComponent', () => {
  let component: RecentAlertsListComponent;
  let fixture: ComponentFixture<RecentAlertsListComponent>;
  let mockService: jasmine.SpyObj<EvaluationDetailsService>;

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

  it('should return default status label if not found', () => {
    const result = component.getStatusLabel('UNKNOWN_STATUS');
    expect(result).toBeDefined();
  });

  it('should return default status color if not found', () => {
    const result = component.getStatusColor('UNKNOWN_STATUS');
    expect(result).toBeDefined();
  });

  it('should return default risk level color if not found', () => {
    const result = component.getRiskLevelColor('UNKNOWN_LEVEL');
    expect(result).toBeDefined();
  });
});
