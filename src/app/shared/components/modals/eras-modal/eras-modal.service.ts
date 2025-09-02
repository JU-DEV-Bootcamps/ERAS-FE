import { Injectable, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ErasModalAction } from './eras-modal.interface';
import { ErasModalComponent } from './eras-modal.component';

@Injectable({ providedIn: 'root' })
export class ErasModalService<T> {
  constructor(private dialog: MatDialog) {}

  openComponent(
    component: Type<T>,
    actions: ErasModalAction[] = [],
    closeButton = true
  ) {
    return this.dialog.open(ErasModalComponent, {
      data: { component, actions, closeButton },
      panelClass: 'eras-modal-component',
    });
  }
}
