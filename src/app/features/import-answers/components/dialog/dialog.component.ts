import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-answer-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
