import { inject, Injectable, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ErasModalAction } from './eras-modal.interface';
import { ErasModalComponent } from './eras-modal.component';

interface ErasModalConfig<P, T> {
  component: Type<T>;
  data?: P;
  actions?: ErasModalAction[];
  title?: string;
  closeButton?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ErasModalService {
  dialog = inject(MatDialog);

  openComponent<P, T>(config: ErasModalConfig<P, T>) {
    return this.dialog.open(ErasModalComponent, {
      data: {
        component: config.component,
        data: config.data,
        actions: config.actions ?? [],
        closeButton: config.closeButton ?? true,
        title: config.title ?? 'Eras Modal',
      },
      panelClass: 'eras-modal-component',
    });
  }
}
