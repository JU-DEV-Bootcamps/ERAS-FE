import { MatDialogConfig } from '@angular/material/dialog';

/** Global panel class that lays a dialog out over the whole screen. */
export const MOBILE_FULLSCREEN_DIALOG_CLASS = 'mobile-fullscreen-dialog';

/** Keeps a small confirmation inside a narrow screen, with a 16px margin on each side. */
export const CONFIRMATION_DIALOG_MAX_WIDTH = 'calc(100vw - 32px)';

/**
 * Returns the size of a dialog for the current screen: the given desktop
 * config from 768px, and the whole screen below it.
 */
export function responsiveDialogSize<D>(
  isMobile: boolean,
  desktop: MatDialogConfig<D>
): MatDialogConfig<D> {
  if (!isMobile) return desktop;

  const panelClass = desktop.panelClass ?? [];
  return {
    ...desktop,
    width: '100vw',
    maxWidth: '100vw',
    minWidth: undefined,
    height: '100dvh',
    maxHeight: '100dvh',
    panelClass: [
      ...(Array.isArray(panelClass) ? panelClass : [panelClass]),
      MOBILE_FULLSCREEN_DIALOG_CLASS,
    ],
  };
}
