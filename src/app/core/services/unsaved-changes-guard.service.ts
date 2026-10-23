import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { filter, Observable, of, switchMap, take, tap } from 'rxjs';
import { ModalDeleteConfirmationComponent } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.component';

@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuardService {
  private readonly dialog = inject(MatDialog);

  attach<T>(
    dialogRef: MatDialogRef<T>,
    hasUnsavedChanges: () => boolean
  ): void {
    dialogRef.disableClose = true;

    dialogRef
      .backdropClick()
      .pipe(switchMap(() => this.confirmIfDirty(hasUnsavedChanges())))
      .subscribe(shouldClose => {
        if (shouldClose) dialogRef.close();
      });

    dialogRef
      .keydownEvents()
      .pipe(
        filter(event => event.key === 'Escape'),
        switchMap(() => this.confirmIfDirty(hasUnsavedChanges()))
      )
      .subscribe(shouldClose => {
        if (shouldClose) dialogRef.close();
      });
  }

  requestClose<T>(
    dialogRef: MatDialogRef<T>,
    hasUnsavedChanges: () => boolean
  ): Observable<boolean> {
    return this.confirmIfDirty(hasUnsavedChanges()).pipe(
      take(1),
      tap(shouldClose => {
        if (shouldClose) dialogRef.close();
      })
    );
  }

  private confirmIfDirty(isDirty: boolean): Observable<boolean> {
    if (!isDirty) return of(true);

    return this.dialog
      .open(ModalDeleteConfirmationComponent, {
        data: {
          title: 'Unsaved changes',
          subtitle:
            'You have unsaved changes. If you leave now, they will be lost.',
          confirmText: 'Discard changes',
          cancelText: 'Keep editing',
        },
        autoFocus: false,
        width: '418px',
        panelClass: 'delete-confirmation-modal',
      })
      .afterClosed();
  }
}
