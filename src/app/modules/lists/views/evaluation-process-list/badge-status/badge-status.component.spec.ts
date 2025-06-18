import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeStatusComponent } from './badge-status.component';
import { EmptyDataComponent } from '../../../../../shared/components/empty-data/empty-data.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { EvaluationModel } from '../../../../../core/models/evaluation.model';

describe('BadgeStatusComponent', () => {
  let component: BadgeStatusComponent;
  let fixture: ComponentFixture<BadgeStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BadgeStatusComponent,
        MatIconModule,
        CommonModule,
        EmptyDataComponent,
      ],
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
});
