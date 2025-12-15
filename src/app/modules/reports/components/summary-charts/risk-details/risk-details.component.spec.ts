import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import RiskDetailsComponent from './risk-details.component';
import { provideHttpClient } from '@angular/common/http';

describe('RiskDetailsComponent', () => {
  let component: RiskDetailsComponent;
  let fixture: ComponentFixture<RiskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskDetailsComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { data: { riskGroup: { data: [] } } },
        },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
