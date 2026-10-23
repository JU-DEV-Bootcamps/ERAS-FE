import { MatDialog } from '@angular/material/dialog';
import { GENERAL_MESSAGES } from '@core/constants/messages';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';

export function openDialogWithStatus(
  text: string,
  isSuccess: boolean,
  csvErrors: string[],
  fileError: string | null,
  dialog: MatDialog,
  onDetailsClick?: () => void
): void {
  const buttonElement = document.activeElement as HTMLElement;
  buttonElement?.blur();

  const errorDetails =
    csvErrors.length > 0 ? csvErrors : [GENERAL_MESSAGES.ERROR_500];

  dialog.open(ModalComponent, {
    ...MODAL_DEFAULT_CONF,
    data: {
      isSuccess,
      type: isSuccess ? 'success' : 'error',
      title: isSuccess
        ? GENERAL_MESSAGES.SUCCESS_IMPORT_TITLE
        : GENERAL_MESSAGES.ERROR_IMPORT_TITLE,
      message: isSuccess ? text : fileError,
      details: isSuccess ? text : errorDetails,
      action:
        isSuccess || !onDetailsClick
          ? null
          : {
              label: 'See details',
              action: onDetailsClick,
            },
    },
  });
}
