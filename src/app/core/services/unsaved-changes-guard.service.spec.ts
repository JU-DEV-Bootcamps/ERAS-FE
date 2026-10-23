import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';

import { UnsavedChangesGuardService } from './unsaved-changes-guard.service';
import { ModalDeleteConfirmationComponent } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.component';

describe('UnsavedChangesGuardService', () => {
  let service: UnsavedChangesGuardService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  let guardedDialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;
  let confirmDialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;

  let backdropClick$: Subject<MouseEvent>;
  let keydownEvents$: Subject<KeyboardEvent>;

  beforeEach(() => {
    backdropClick$ = new Subject<MouseEvent>();
    keydownEvents$ = new Subject<KeyboardEvent>();

    guardedDialogRefSpy = jasmine.createSpyObj<MatDialogRef<unknown>>(
      'MatDialogRef',
      ['close', 'backdropClick', 'keydownEvents']
    );
    guardedDialogRefSpy.backdropClick.and.returnValue(
      backdropClick$.asObservable()
    );
    guardedDialogRefSpy.keydownEvents.and.returnValue(
      keydownEvents$.asObservable()
    );

    confirmDialogRefSpy = jasmine.createSpyObj<MatDialogRef<unknown>>(
      'MatDialogRef',
      ['afterClosed']
    );

    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogSpy.open.and.returnValue(confirmDialogRefSpy);

    TestBed.configureTestingModule({
      providers: [
        UnsavedChangesGuardService,
        { provide: MatDialog, useValue: dialogSpy },
      ],
    });

    service = TestBed.inject(UnsavedChangesGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('attach()', () => {
    it('should disable closing by default on the attached dialog', () => {
      service.attach(guardedDialogRefSpy, () => false);

      expect(guardedDialogRefSpy.disableClose).toBeTrue();
    });

    describe('Backdrop Click Handling', () => {
      it('should close the dialog directly if there are NO unsaved changes', () => {
        service.attach(guardedDialogRefSpy, () => false);

        backdropClick$.next(new MouseEvent('click'));

        expect(dialogSpy.open).not.toHaveBeenCalled();
        expect(guardedDialogRefSpy.close).toHaveBeenCalled();
      });

      it('should open confirmation dialog and CLOSE original if user chooses to discard (true)', () => {
        confirmDialogRefSpy.afterClosed.and.returnValue(of(true));

        service.attach(guardedDialogRefSpy, () => true);

        backdropClick$.next(new MouseEvent('click'));

        expect(dialogSpy.open).toHaveBeenCalledWith(
          ModalDeleteConfirmationComponent,
          jasmine.objectContaining({
            width: '418px',
            data: jasmine.objectContaining({ title: 'Unsaved changes' }),
          })
        );
        expect(guardedDialogRefSpy.close).toHaveBeenCalled();
      });

      it('should open confirmation dialog and KEEP OPEN original if user chooses to keep editing (false)', () => {
        confirmDialogRefSpy.afterClosed.and.returnValue(of(false));

        service.attach(guardedDialogRefSpy, () => true);

        backdropClick$.next(new MouseEvent('click'));

        expect(dialogSpy.open).toHaveBeenCalled();
        expect(guardedDialogRefSpy.close).not.toHaveBeenCalled();
      });
    });

    describe('Keydown Events Handling', () => {
      it('should trigger close flow if "Escape" key is pressed and NO unsaved changes exist', () => {
        service.attach(guardedDialogRefSpy, () => false);

        keydownEvents$.next(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(dialogSpy.open).not.toHaveBeenCalled();
        expect(guardedDialogRefSpy.close).toHaveBeenCalled();
      });

      it('should IGNORE any key that is NOT "Escape"', () => {
        service.attach(guardedDialogRefSpy, () => false);

        keydownEvents$.next(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(dialogSpy.open).not.toHaveBeenCalled();
        expect(guardedDialogRefSpy.close).not.toHaveBeenCalled();
      });
    });
  });

  describe('requestClose()', () => {
    it('should close the dialog and emit true if there are NO unsaved changes', done => {
      service
        .requestClose(guardedDialogRefSpy, () => false)
        .subscribe(result => {
          expect(result).toBeTrue();
          expect(dialogSpy.open).not.toHaveBeenCalled();
          expect(guardedDialogRefSpy.close).toHaveBeenCalled();
          done();
        });
    });

    it('should close the dialog and emit true if user confirms discarding changes', done => {
      confirmDialogRefSpy.afterClosed.and.returnValue(of(true));

      service
        .requestClose(guardedDialogRefSpy, () => true)
        .subscribe(result => {
          expect(result).toBeTrue();
          expect(dialogSpy.open).toHaveBeenCalled();
          expect(guardedDialogRefSpy.close).toHaveBeenCalled();
          done();
        });
    });

    it('should NOT close the dialog and emit false if user decides to keep editing', done => {
      confirmDialogRefSpy.afterClosed.and.returnValue(of(false));

      service
        .requestClose(guardedDialogRefSpy, () => true)
        .subscribe(result => {
          expect(result).toBeFalse();
          expect(dialogSpy.open).toHaveBeenCalled();
          expect(guardedDialogRefSpy.close).not.toHaveBeenCalled();
          done();
        });
    });
  });
});
