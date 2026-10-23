import { TestBed } from '@angular/core/testing';

import { ToastNotificationService } from './toast-notification.service';
import { ToastNotificationData } from '@core/models/toast-notification.model';

describe('ToastNotificationService', () => {
  let service: ToastNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showToast / closeToast', () => {
    const buildToast = (): ToastNotificationData =>
      ({
        message: 'Something happened',
        type: 'success',
      }) as ToastNotificationData;

    let onNext: jasmine.Spy<(state: ToastNotificationData | null) => void>;

    beforeEach(() => {
      jasmine.clock().install();
      onNext = jasmine.createSpy('onNext');
      service.toastState$.subscribe(onNext);
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should emit null as the initial toastState$ value', () => {
      expect(onNext).toHaveBeenCalledWith(null);
    });

    it('should emit the toast immediately on showToast', () => {
      const toast = buildToast();

      service.showToast(toast);

      expect(onNext).toHaveBeenCalledWith(toast);
    });

    it('should auto-close after the default 3000ms when fixed is not passed', () => {
      const toast = buildToast();

      service.showToast(toast);
      expect(onNext.calls.mostRecent().args[0]).toEqual(toast);

      jasmine.clock().tick(2999);
      expect(onNext.calls.mostRecent().args[0]).toEqual(toast);

      jasmine.clock().tick(1);
      expect(onNext.calls.mostRecent().args[0]).toBeNull();
    });

    it('should auto-close after the default 3000ms when fixed is explicitly false', () => {
      const toast = buildToast();

      service.showToast(toast, false);
      jasmine.clock().tick(3000);

      expect(onNext.calls.mostRecent().args[0]).toBeNull();
    });

    it('should NOT auto-close when fixed is true', () => {
      const toast = buildToast();

      service.showToast(toast, true);
      jasmine.clock().tick(10000);

      expect(onNext.calls.mostRecent().args[0]).toEqual(toast);
    });

    it('closeToast should close immediately when called with no delay', () => {
      const toast = buildToast();

      service.showToast(toast, true); // fixed, so no auto-close scheduled
      expect(onNext.calls.mostRecent().args[0]).toEqual(toast);

      service.closeToast();
      jasmine.clock().tick(0);

      expect(onNext.calls.mostRecent().args[0]).toBeNull();
    });

    it('closeToast should respect a custom delay', () => {
      const toast = buildToast();

      service.showToast(toast, true);
      service.closeToast(500);

      jasmine.clock().tick(499);
      expect(onNext.calls.mostRecent().args[0]).toEqual(toast);

      jasmine.clock().tick(1);
      expect(onNext.calls.mostRecent().args[0]).toBeNull();
    });

    it('should replace the previous toast when showToast is called again before it closes', () => {
      const toastA = buildToast();
      const toastB = {
        ...buildToast(),
        message: 'Second toast',
      } as ToastNotificationData;

      service.showToast(toastA, true);
      expect(onNext.calls.mostRecent().args[0]).toEqual(toastA);

      service.showToast(toastB, true);
      expect(onNext.calls.mostRecent().args[0]).toEqual(toastB);
    });
  });
});
