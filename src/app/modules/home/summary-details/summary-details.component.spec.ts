import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Breakpoints } from '@angular/cdk/layout';
import { SummaryDetailsComponent } from './summary-details.component';

describe('SummaryDetailsComponent', () => {
  let component: SummaryDetailsComponent;
  let fixture: ComponentFixture<SummaryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: of({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('SummaryDetailsComponent - grid columns logic', () => {
  let component: SummaryDetailsComponent;
  let fixture: ComponentFixture<SummaryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: of({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should call breakpointObserver.observe with XSmall and Small breakpoints', () => {
    spyOn(component.breakpointObserver, 'observe').and.returnValue(
      of({ matches: false, breakpoints: {} })
    );

    fixture.detectChanges();

    expect(component.breakpointObserver.observe).toHaveBeenCalledWith([
      Breakpoints.XSmall,
      Breakpoints.Small,
    ]);
  });

  it('should set cardsGridColumns$ to 1 on XSmall breakpoint', done => {
    spyOn(component.breakpointObserver, 'observe').and.returnValue(
      of({
        matches: true,
        breakpoints: {
          [Breakpoints.XSmall]: true,
          [Breakpoints.Small]: false,
        },
      })
    );

    fixture.detectChanges();

    component.cardsGridColumns$?.subscribe(columns => {
      expect(columns).toBe(1);
      done();
    });
  });

  it('should set cardsGridColumns$ to 3 on Small breakpoint', done => {
    spyOn(component.breakpointObserver, 'observe').and.returnValue(
      of({
        matches: true,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: true,
        },
      })
    );

    fixture.detectChanges();

    component.cardsGridColumns$?.subscribe(columns => {
      expect(columns).toBe(3);
      done();
    });
  });

  it('should set cardsGridColumns$ to 3 by default (desktop, no breakpoint matched)', done => {
    spyOn(component.breakpointObserver, 'observe').and.returnValue(
      of({
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      })
    );

    fixture.detectChanges();

    component.cardsGridColumns$?.subscribe(columns => {
      expect(columns).toBe(3);
      done();
    });
  });
});
