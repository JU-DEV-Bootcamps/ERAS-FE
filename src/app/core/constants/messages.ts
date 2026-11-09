import { DialogType } from '@shared/components/modals/modal-dialog/types/dialog';

export const IMPORT_MESSAGES = {
  ANSWERS_SUCCESS:
    'The survey’s answers were saved in the system successfully.',
  ANSWERS_PREVIEW_EMPTY: 'No data found, try other parameters.',
  ANSWERS_IMPORT_EMPTY: 'This poll has no data available to import.',
  ANSWERS_PREVIEW_OK: 'Information obtained successfully.',
  ANSWERS_ERROR:
    'There was an error with the import, please try again or check the values.',
  STUDENT_SUCCESS:
    'The students information was saved into the system successfully.',
  STUDENT_ERROR:
    'There was an error during the import process, please try again.',
  ANSWERS_ERROR_DETAILS:
    'Check your evaluation process data and your Cosmic Latte configuration.',
};

export const VALIDATION_MESSAGES = {
  FILE_SIZE_EXCEEDED: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type, please select a correct file.',
  CSV_SCAN_ERROR: 'Following errors detected',
};

export const STUDENT_PROFILE_MESSAGES = {
  TITLE: 'Profile summary',
  NOT_AVAILABLE: '-',
  LOAD_ERROR: 'Could not load the student profile. Please try again later.',
  NO_COURSES: 'No current courses.',
  THIRD_ATTEMPT: 'Third attempt',
  YES: 'Yes',
  CLOSE: 'Close',
  SECTION_PERSONAL: 'Personal information',
  SECTION_ACADEMIC: 'Current academic information',
  FIRST_NAMES: 'First names',
  INSTITUTIONAL_EMAIL: 'Institutional email',
  SIS_ID: 'SIS ID',
  ID_PASSPORT_NUMBER: 'ID/Passport number',
  MOBILE_NUMBER: 'Mobile number',
  COUNTRY: 'Country',
  COHORT: 'Cohort',
  CURRENT_CGPA: 'Current CGPA',
  SAP_STATUS: 'SAP status',
  CURRENT_COURSES: 'Current courses',
  PASSED_COURSES: 'Passed courses',
  FAILED_COURSES: 'Failed courses',
  COURSE_NAME: 'Course name',
  COURSE_GROUP: 'Group',
  COURSE_SECTION: 'Section',
};

export const USER_MANUALS_MESSAGES = {
  EMPTY: 'No user manuals are available yet.',
  LOAD_ERROR: 'Could not load the user manuals. Please try again later.',
};

export const PROFESSIONAL_PROFILE_MESSAGES = {
  SAVE_ERROR:
    'Your professional information could not be saved. Please try again.',
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
  ERROR_400: 'Bad Request',
  INVALID_TYPE_ERROR_400: (attribute: string) =>
    `The property ${attribute} cannot be converted to the required type.`,
};

export const INTERVENTION_ACTIVITY_MESSAGES = {
  TITLE: 'Activity history',
  EMPTY: 'No activity recorded yet.',
};

export const LAYOUT_MESSAGES = {
  OPEN_MENU: 'Open menu',
};

export const ASSESSMENT_ACTIVITY_MESSAGES = {
  TITLE: 'Activity history',
  EMPTY: 'No activity recorded yet.',
};

export const STUDENT_INTERVENTION_MESSAGES = {
  SECTION_TITLE: 'Interventions',
  RISKS_TITLE: 'Risks identified',
  SUPPORT_TITLE: 'Support received',
  NO_RISKS: 'No risks identified yet.',
  NO_SUPPORT: 'No support received yet.',
  ADD_RISK: 'Add risk',
  ADD_SUPPORT: 'Add support',
  EDIT: 'Edit',
  DELETE: 'Delete',
  CREATED_BY: 'Created by',
  ADD_RISK_TITLE: 'Add risk identified',
  EDIT_RISK_TITLE: 'Edit risk identified',
  ADD_SUPPORT_TITLE: 'Add support received',
  EDIT_SUPPORT_TITLE: 'Edit support received',
  FIELD_TYPE: 'Type',
  FIELD_DESCRIPTION: 'Description',
  FIELD_DATE: 'Date',
  SELECT_TYPE: 'Select a type',
  SAVE: 'Save',
  SAVING: 'Saving...',
  CANCEL: 'Cancel',
  DELETE_TITLE: 'Delete entry',
  DELETE_SUBTITLE:
    'This entry will be removed from the student profile. Do you want to continue?',
  SAVE_SUCCESS: 'The entry was saved.',
  SAVE_ERROR: 'The entry could not be saved, please try again.',
  DELETE_SUCCESS: 'The entry was deleted.',
  DELETE_ERROR: 'The entry could not be deleted, please try again.',
  LOAD_ERROR: 'The interventions could not be loaded, please try again.',
};

export const STUDENTS_MESSAGES = {
  SEARCH_PLACEHOLDER: 'Search by name',
  SEARCH_CLEAR: 'Clear search',
  SEARCH_NO_RESULTS: 'No students found.',
  NO_DATA: 'No data available.',
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
