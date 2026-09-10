import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';

import { ToastNotificationComponent } from './toast-notification.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';

interface MockToast {
  message: string;
  type: string;
}

describe('ToastNotificationComponent', () => {
  let component: ToastNotificationComponent;
  let fixture: ComponentFixture<ToastNotificationComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastNotificationService>;

  const mockToast: MockToast = {
    message: 'Operación realizada con éxito',
    type: 'success',
  };

  beforeEach(async () => {
    toastServiceSpy = jasmine.createSpyObj<ToastNotificationService>(
      'ToastNotificationService',
      ['closeToast']
    );
    (
      toastServiceSpy as unknown as {
        toastState$: Observable<MockToast | null>;
      }
    ).toastState$ = of(mockToast);

    await TestBed.configureTestingModule({
      imports: [ToastNotificationComponent],
      providers: [
        { provide: ToastNotificationService, useValue: toastServiceSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toast$', () => {
    it('should expose toastState$ from ToastNotificationService', (done: DoneFn) => {
      component.toast$.subscribe((toast: unknown) => {
        expect(toast).toEqual(mockToast);
        done();
      });
    });

    it('should handle null emission from toastState$', (done: DoneFn) => {
      (
        toastServiceSpy as unknown as { toastState$: Observable<unknown> }
      ).toastState$ = of(null);
      const newFixture = TestBed.createComponent(ToastNotificationComponent);
      const newComponent = newFixture.componentInstance;

      newComponent.toast$.subscribe((toast: unknown) => {
        expect(toast).toBeNull();
        done();
      });
    });
  });

  describe('closeToast', () => {
    it('should call closeToast on ToastNotificationService when closeToast is called', () => {
      component.closeToast();

      expect(toastServiceSpy.closeToast).toHaveBeenCalled();
    });
  });
});
