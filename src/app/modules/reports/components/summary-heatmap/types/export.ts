import { ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ExportArgs {
  fileName: string;
  container: ElementRef;
  snackBar?: MatSnackBar;
  preProcess?: string;
}
