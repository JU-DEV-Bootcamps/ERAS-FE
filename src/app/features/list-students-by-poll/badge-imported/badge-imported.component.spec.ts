import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeImportedComponent } from './badge-imported.component';
import { MatIconModule } from '@angular/material/icon';
import { EmptyDataComponent } from '../../../shared/components/empty-data/empty-data.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { StudentModel } from '@core/models/student.model';

describe('BadgeImportedComponent', () => {
  let component: BadgeImportedComponent;
  let fixture: ComponentFixture<BadgeImportedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BadgeImportedComponent,
        MatIconModule,
        CommonModule,
        EmptyDataComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeImportedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "Imported" badge when element.isImported is true', () => {
    component.element = { isImported: true } as StudentModel;
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.badge-success'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('Imported');
    const icon = badge.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent).toContain('check_circle');
  });

  it('should show "Not imported" badge when element.isImported is false', () => {
    component.element = { isImported: false } as StudentModel;
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.badge-secondary'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('Not imported');
    const icon = badge.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent).toContain('cancel');
  });

  it('should show empty data message when element is undefined', () => {
    component.element = undefined;
    fixture.detectChanges();

    const emptyData = fixture.debugElement.query(
      By.directive(EmptyDataComponent)
    );
    expect(emptyData).toBeTruthy();
    expect(emptyData.nativeElement.textContent).toContain('No student found');
  });
});
