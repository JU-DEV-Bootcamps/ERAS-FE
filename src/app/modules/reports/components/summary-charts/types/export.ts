import { ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ExportArgs {
  fileName: string;
  container: ElementRef;
  snackBar?: MatSnackBar;
  preProcess?: string;
  title?: string;
  callback?: () => void;
}

export const LETTER_PX = { portrait: 816, landscape: 1056 };

export interface ExportArgsChunked extends ExportArgs {
  totalChunks: number;
  getChunkElement: (chunkIndex: number, total: number) => Promise<HTMLElement>;
  onChunkDone?: (chunkIndex: number, total: number) => Promise<void>;
}
