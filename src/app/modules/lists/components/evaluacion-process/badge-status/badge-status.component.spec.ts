import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BadgeStatusComponent } from './badge-status.component';
import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { EvaluationModel } from '@core/models/evaluation.model';

describe('BadgeStatusComponent', () => {
  let component: BadgeStatusComponent;
  let fixture: ComponentFixture<BadgeStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the status badge with correct class and text when element is defined', () => {
    component.element = { status: 'In Progress' } as EvaluationModel;
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.badgeStatus'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('In Progress');
    expect(badge.nativeElement.className).toContain('In_Progress');
  });

  it('should show the empty data message when element is undefined', () => {
    component.element = undefined;
    fixture.detectChanges();

    const emptyData = fixture.debugElement.query(
      By.directive(EmptyDataComponent)
    );
    expect(emptyData).toBeTruthy();
    expect(emptyData.nativeElement.textContent).toContain(
      'No evaluation process found'
    );
  });

  describe('getClassName', () => {
    it('should replace spaces with underscores when value has spaces', () => {
      expect(component.getClassName('Pending Review')).toBe('Pending_Review');
    });

    it('should return empty string when value is empty', () => {
      expect(component.getClassName('')).toBe('');
    });

    it('should handle falsy values safely', () => {
      expect(component.getClassName(null as unknown as string)).toBe('');
      expect(component.getClassName(undefined as unknown as string)).toBe('');
    });
  });
});
