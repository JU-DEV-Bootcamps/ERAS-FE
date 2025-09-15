import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ReferralsService } from './services/referrals.service';
import ReferralsComponent from './referrals.component';

describe('ReferralsComponent', () => {
  let component: ReferralsComponent;
  let fixture: ComponentFixture<ReferralsComponent>;

  const mockActivatedRoute = {
    snapshot: {
      data: {
        referrals: { items: [], count: 0 },
      },
    },
  };

  const mockReferralsService = {
    getReferralsPagination: () => of({ items: [], count: 0 }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
        { provide: ReferralsService, useValue: mockReferralsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
