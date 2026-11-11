import { MatDialogConfig } from '@angular/material/dialog';

import {
  MOBILE_FULLSCREEN_DIALOG_CLASS,
  responsiveDialogSize,
} from './responsive-dialog-size';

describe('responsiveDialogSize', () => {
  const desktop: MatDialogConfig = {
    width: '40vw',
    minWidth: '500px',
    autoFocus: false,
    panelClass: 'assessment-modal-panel',
  };

  it('returns the desktop config untouched on a desktop screen', () => {
    expect(responsiveDialogSize(false, desktop)).toEqual(desktop);
  });

  it('covers the whole screen and drops the minimum width on a mobile screen', () => {
    const config = responsiveDialogSize(true, desktop);

    expect(config.width).toBe('100vw');
    expect(config.maxWidth).toBe('100vw');
    expect(config.height).toBe('100dvh');
    expect(config.maxHeight).toBe('100dvh');
    expect(config.minWidth).toBeUndefined();
    expect(config.autoFocus).toBeFalse();
    expect(config.panelClass).toEqual([
      'assessment-modal-panel',
      MOBILE_FULLSCREEN_DIALOG_CLASS,
    ]);
  });

  it('adds the full-screen class when the desktop config has no panel class', () => {
    const config = responsiveDialogSize(true, { width: '520px' });

    expect(config.panelClass).toEqual([MOBILE_FULLSCREEN_DIALOG_CLASS]);
  });

  it('keeps every panel class of a desktop config that has several', () => {
    const config = responsiveDialogSize(true, { panelClass: ['a', 'b'] });

    expect(config.panelClass).toEqual([
      'a',
      'b',
      MOBILE_FULLSCREEN_DIALOG_CLASS,
    ]);
  });
});
