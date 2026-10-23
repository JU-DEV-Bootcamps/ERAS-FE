import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { DialogService } from './dialog.service';
import { TYPE_TITLE } from '@core/constants/messages';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';
import { DialogType } from '@shared/components/modals/modal-dialog/types/dialog';

describe('DialogService', () => {
  let service: DialogService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ModalComponent>>;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<ModalComponent>>(
      'MatDialogRef',
      ['afterClosed']
    );

    dialogRefSpy.afterClosed.and.returnValue(
      of('mock_dialog_result' as unknown as MatDialog)
    );

    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogSpy.open.and.returnValue(dialogRefSpy);

    TestBed.configureTestingModule({
      providers: [DialogService, { provide: MatDialog, useValue: dialogSpy }],
    });

    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a dialog with all parameters, call blur, and return an observable', done => {
    const descriptionMessage = 'An error occurred';
    const mockType = 'ERROR' as unknown as DialogType;
    const extraMessage = 'Please try again later';

    const activeElement = document.activeElement as HTMLElement;
    const blurSpy = spyOn(activeElement, 'blur');

    service
      .openDialog(descriptionMessage, mockType, extraMessage)
      .subscribe(result => {
        expect(result).toBe('mock_dialog_result' as unknown as MatDialog);
        done();
      });

    expect(blurSpy).toHaveBeenCalled();
    expect(dialogSpy.open).toHaveBeenCalledWith(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: {
        type: mockType,
        title: TYPE_TITLE[mockType],
        message: extraMessage,
        details: [descriptionMessage],
      },
    });
  });

  it('should open a dialog correctly when extraMessage is NOT provided', () => {
    const descriptionMessage = 'Operation successful';
    const mockType = 'SUCCESS' as unknown as DialogType;

    const activeElement = document.activeElement as HTMLElement;
    spyOn(activeElement, 'blur');

    service.openDialog(descriptionMessage, mockType);

    expect(dialogSpy.open).toHaveBeenCalledWith(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: {
        type: mockType,
        title: TYPE_TITLE[mockType],
        message: undefined,
        details: [descriptionMessage],
      },
    });
  });
});
