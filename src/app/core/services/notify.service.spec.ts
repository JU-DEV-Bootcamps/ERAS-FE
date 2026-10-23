import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { NotifyService } from './notify.service';
import { GENERAL_MESSAGES } from '@core/constants/messages';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';

describe('NotifyService', () => {
  let service: NotifyService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialogSpy }],
    });
    service = TestBed.inject(NotifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success()', () => {
    it('should open the dialog with success configurations', () => {
      const message = 'Data saved successfully';

      service.success(message);

      expect(dialogSpy.open).toHaveBeenCalledWith(ModalComponent, {
        ...MODAL_DEFAULT_CONF,
        data: {
          type: 'success',
          isSuccess: true,
          title: GENERAL_MESSAGES.SUCCESS_TITLE,
          success: {
            details: message,
          },
          error: {
            title: GENERAL_MESSAGES.ERROR_TITLE,
            details: [message],
            message: message,
          },
          details: [message],
        },
      });
    });
  });

  describe('error()', () => {
    it('should open the dialog with error configurations', () => {
      const message = 'An unexpected error occurred';

      service.error(message);

      expect(dialogSpy.open).toHaveBeenCalledWith(ModalComponent, {
        ...MODAL_DEFAULT_CONF,
        data: {
          type: 'error',
          isSuccess: false,
          title: GENERAL_MESSAGES.ERROR_TITLE,
          success: {
            details: message,
          },
          error: {
            title: GENERAL_MESSAGES.ERROR_TITLE,
            details: [message],
            message: message,
          },
          details: [message],
        },
      });
    });

    it('should fallback to "Unknown error" if a non-string object is provided', () => {
      const invalidMessage = null as unknown as string;

      service.error(invalidMessage);

      expect(dialogSpy.open).toHaveBeenCalledWith(ModalComponent, {
        ...MODAL_DEFAULT_CONF,
        data: {
          type: 'error',
          isSuccess: false,
          title: GENERAL_MESSAGES.ERROR_TITLE,
          success: {
            details: 'Unknown error',
          },
          error: {
            title: GENERAL_MESSAGES.ERROR_TITLE,
            details: ['Unknown error'],
            message: 'Unknown error',
          },
          details: ['Unknown error'],
        },
      });
    });
  });

  describe('openDialog()', () => {
    it('should open the dialog directly passing the isSuccess flag as true', () => {
      const customMessage = 'Direct modal call';

      service.openDialog(customMessage, true);

      expect(dialogSpy.open).toHaveBeenCalledTimes(1);

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ModalComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            type: 'success',
            details: [customMessage],
          }),
        })
      );
    });
  });
});
