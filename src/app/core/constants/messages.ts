import { DialogType } from '@shared/components/modals/modal-dialog/types/dialog';

export const IMPORT_MESSAGES = {
  ANSWERS_SUCCESS:
    'The survey’s answers were saved in the system successfully.',
  ANSWERS_PREVIEW_EMPTY: 'No data found, try other parameters.',
  ANSWERS_PREVIEW_OK: 'Information obtained successfully.',
  ANSWERS_ERROR:
    'There was an error with the import, please try again or check the values.',
  STUDENT_SUCCESS:
    'The students information was saved into the system successfully.',
  STUDENT_ERROR:
    'There was an error during the import process, please try again.',
};

export const VALIDATION_MESSAGES = {
  FILE_SIZE_EXCEEDED: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type, please select a correct file.',
  CSV_SCAN_ERROR: 'Following errors detected',
};

export const GENERAL_MESSAGES = {
  ERROR_TITLE: 'Error',
  ERROR_IMPORT_TITLE: 'Error Importing file',
  ERROR_500: 'Internal error, please try again.',
  ERROR_UNKNOWN: 'Please contact support - The following error occurred: ',
  ERROR_FORM: 'Error Submitting form',
  INFO_TITLE: 'Info',
  SUCCESS_TITLE: 'Successful',
  SUCCESS_CREATE: 'Successful Create',
  SUCCESS_IMPORT_TITLE: 'Successful import',
  WARNING_TITLE: 'Warning',
  DETAILS: 'Details:',
};

export const TYPE_ICON: Record<DialogType, string> = {
  error: 'error',
  info: 'info',
  success: 'done',
  warning: 'warning',
};

export const TYPE_TITLE: Record<DialogType, string> = {
  error: GENERAL_MESSAGES.ERROR_TITLE,
  info: GENERAL_MESSAGES.INFO_TITLE,
  success: GENERAL_MESSAGES.SUCCESS_TITLE,
  warning: GENERAL_MESSAGES.WARNING_TITLE,
};
