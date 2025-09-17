import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';
import ReferralDetailComponent from './referral-detail.component';

describe('ReferralDetailComponent', () => {
  let component: ReferralDetailComponent;
  let fixture: ComponentFixture<ReferralDetailComponent>;

  const mockActivatedRoute = {
    data: of({ referral: [{}] }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReferralDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
