import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralsGridComponent } from './referrals-grid.component';
import { ActivatedRoute } from '@angular/router';

describe('ReferralsGridComponent', () => {
  let component: ReferralsGridComponent;
  let fixture: ComponentFixture<ReferralsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralsGridComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReferralsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
