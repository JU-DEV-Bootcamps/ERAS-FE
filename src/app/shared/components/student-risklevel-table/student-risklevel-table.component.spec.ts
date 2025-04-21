import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StudentRisklevelTableComponent } from './student-risklevel-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';

describe('StudentRisklevelTableComponent', () => {
  let component: StudentRisklevelTableComponent;
  let fixture: ComponentFixture<StudentRisklevelTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentRisklevelTableComponent],
      imports: [MatTableModule, MatProgressBarModule, MatIconModule],
      providers: [
        DecimalPipe,
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        { provide: MAT_DIALOG_DATA, useValue: { students: [] } },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentRisklevelTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog when closeDialog is called', () => {
    component.closeDialog();
    const dialogRef = TestBed.inject(MatDialogRef);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should return the correct color for a given risk level', () => {
    const lowRiskColor = component.getColorRisk('1');
    const highRiskColor = component.getColorRisk('4');
    const defaultColor = component.getColorRisk(null);

    expect(lowRiskColor).toBe('#3CB371'); // Example color for low risk
    expect(highRiskColor).toBe('#FFA500'); // Example color for high risk
    expect(defaultColor).toBe('#FF0000'); // Default color
  });

  it('should identify high-risk levels correctly', () => {
    const highRisk = component.hasHighRisk('4');
    const lowRisk = component.hasHighRisk('2');
    const noRisk = component.hasHighRisk(null);

    expect(highRisk).toBe('#FF0000'); // Default color for high risk
    expect(lowRisk).toBe(''); // No color for low risk
    expect(noRisk).toBe(''); // No color for null risk
  });

  it('should log the student ID when redirectToStudentDetail is called', () => {
    spyOn(console, 'info');
    component.redirectToStudentDetail('12345');
    expect(console.info).toHaveBeenCalledWith('retrieve student 12345');
  });
});
