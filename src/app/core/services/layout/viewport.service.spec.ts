import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { MOBILE_MEDIA_QUERY, ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let changes: BehaviorSubject<BreakpointState>;
  let observer: jasmine.SpyObj<BreakpointObserver>;

  const setup = (initiallyMatched: boolean) => {
    changes = new BehaviorSubject<BreakpointState>({
      matches: initiallyMatched,
      breakpoints: {},
    });
    observer = jasmine.createSpyObj<BreakpointObserver>('BreakpointObserver', [
      'observe',
      'isMatched',
    ]);
    observer.isMatched.and.returnValue(initiallyMatched);
    observer.observe.and.returnValue(changes);
    TestBed.configureTestingModule({
      providers: [{ provide: BreakpointObserver, useValue: observer }],
    });
    return TestBed.inject(ViewportService);
  };

  it('starts with the value the media query has when it is created', () => {
    expect(setup(true).isMobile()).toBeTrue();
    expect(observer.observe).toHaveBeenCalledWith(MOBILE_MEDIA_QUERY);
  });

  it('follows the media query when the screen changes size', () => {
    const service = setup(false);
    expect(service.isMobile()).toBeFalse();

    changes.next({ matches: true, breakpoints: {} });
    expect(service.isMobile()).toBeTrue();

    changes.next({ matches: false, breakpoints: {} });
    expect(service.isMobile()).toBeFalse();
  });

  it('treats screens narrower than 768px as mobile', () => {
    expect(MOBILE_MEDIA_QUERY).toBe('(max-width: 767.98px)');
  });
});
