import { Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TYPE_ICON } from '@core/constants/messages';

@Component({
  selector: 'app-success-fail',
  imports: [MatIconModule, NgClass],
  templateUrl: './success-fail.component.html',
  styleUrl: './success-fail.component.scss',
})
export class SuccessFailComponent {
  matDialogData = inject(MAT_DIALOG_DATA);
  successFail = computed(() => this.matDialogData.data);

  get isSuccess(): boolean {
    return this.successFail().type === TYPE_ICON.success;
  }
}
