import {
  AfterViewInit,
  Component,
  EnvironmentInjector,
  EventEmitter,
  inject,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { FormGroup } from '@angular/forms';

import { ErasModalAction, ErasModalData } from './eras-modal.interface';

@Component({
  selector: 'app-eras-modal',
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './eras-modal.component.html',
  styleUrl: './eras-modal.component.scss',
})
export class ErasModalComponent implements AfterViewInit {
  @ViewChild('erasModalContainer', { read: ViewContainerRef })
  erasModalContainer!: ViewContainerRef;

  data = inject<ErasModalData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ErasModalComponent>);
  envInjector = inject(EnvironmentInjector);

  ngAfterViewInit() {
    if (!this.data.component) return;

    this.erasModalContainer.clear();

    // Creates dinamically the inner component.
    const componentReference = this.erasModalContainer.createComponent(
      this.data.component!,
      { environmentInjector: this.envInjector }
    );

    // Link the FormGroup if the inner component has a form.
    const instComp = componentReference.instance;
    if (!this.data.form && instComp?.form instanceof FormGroup) {
      this.data.form = instComp.form;
    }
    if (instComp.formReady instanceof EventEmitter) {
      instComp.formReady.subscribe(
        (formGroup: FormGroup) => (this.data.form = formGroup)
      );
    }
  }

  onAction(action: ErasModalAction) {
    if (action.value === 'save' && this.data.form) {
      if (this.data.form.invalid) {
        this.data.form.markAllAsTouched();
        return;
      }
      this.dialogRef.close({ type: 'save', data: this.data.form.value });
      return;
    }
    this.dialogRef.close(action.value);
  }
}
