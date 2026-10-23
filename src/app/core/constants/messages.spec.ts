import { DialogType } from '@shared/components/modals/modal-dialog/types/dialog';
import {
  GENERAL_MESSAGES,
  IMPORT_MESSAGES,
  TYPE_ICON,
  TYPE_TITLE,
  VALIDATION_MESSAGES,
} from './messages';

describe('Messages Constants', () => {
  describe('GENERAL_MESSAGES', () => {
    it('should format INVALID_TYPE_ERROR_400 correctly with the provided attribute', () => {
      const attribute = 'studentId';
      const result = GENERAL_MESSAGES.INVALID_TYPE_ERROR_400(attribute);

      expect(result).toBe(
        'The property studentId cannot be converted to the required type.'
      );
    });

    it('should have all general title and error messages defined', () => {
      expect(GENERAL_MESSAGES.ERROR_TITLE).toBe('Error');
      expect(GENERAL_MESSAGES.ERROR_IMPORT_TITLE).toBe('Error Importing file');
      expect(GENERAL_MESSAGES.ERROR_500).toBe(
        'Internal error, please try again.'
      );
      expect(GENERAL_MESSAGES.ERROR_UNKNOWN).toBe(
        'Please contact support - The following error occurred: '
      );
      expect(GENERAL_MESSAGES.ERROR_FORM).toBe('Error Submitting form');
      expect(GENERAL_MESSAGES.INFO_TITLE).toBe('Info');
      expect(GENERAL_MESSAGES.SUCCESS_TITLE).toBe('Successful');
      expect(GENERAL_MESSAGES.SUCCESS_CREATE).toBe('Successful Create');
      expect(GENERAL_MESSAGES.SUCCESS_IMPORT_TITLE).toBe('Successful import');
      expect(GENERAL_MESSAGES.WARNING_TITLE).toBe('Warning');
      expect(GENERAL_MESSAGES.DETAILS).toBe('Details:');
      expect(GENERAL_MESSAGES.ERROR_400).toBe('Bad Request');
    });
  });

  describe('IMPORT_MESSAGES', () => {
    it('should have all import messages defined', () => {
      expect(IMPORT_MESSAGES.ANSWERS_SUCCESS).toBe(
        'The survey’s answers were saved in the system successfully.'
      );
      expect(IMPORT_MESSAGES.ANSWERS_PREVIEW_EMPTY).toBe(
        'No data found, try other parameters.'
      );
      expect(IMPORT_MESSAGES.ANSWERS_IMPORT_EMPTY).toBe(
        'This poll has no data available to import.'
      );
      expect(IMPORT_MESSAGES.ANSWERS_PREVIEW_OK).toBe(
        'Information obtained successfully.'
      );
      expect(IMPORT_MESSAGES.ANSWERS_ERROR).toBe(
        'There was an error with the import, please try again or check the values.'
      );
      expect(IMPORT_MESSAGES.STUDENT_SUCCESS).toBe(
        'The students information was saved into the system successfully.'
      );
      expect(IMPORT_MESSAGES.STUDENT_ERROR).toBe(
        'There was an error during the import process, please try again.'
      );
      expect(IMPORT_MESSAGES.ANSWERS_ERROR_DETAILS).toBe(
        'Check your evaluation process data and your Cosmic Latte configuration.'
      );
    });
  });

  describe('VALIDATION_MESSAGES', () => {
    it('should have all validation messages defined', () => {
      expect(VALIDATION_MESSAGES.FILE_SIZE_EXCEEDED).toBe(
        'File size exceeds the maximum limit.'
      );
      expect(VALIDATION_MESSAGES.INVALID_FILE_TYPE).toBe(
        'Invalid file type, please select a correct file.'
      );
      expect(VALIDATION_MESSAGES.CSV_SCAN_ERROR).toBe(
        'Following errors detected'
      );
    });
  });

  describe('TYPE_ICON', () => {
    it('should map each DialogType to its corresponding icon name', () => {
      const dialogTypes: DialogType[] = ['error', 'info', 'success', 'warning'];

      expect(TYPE_ICON.error).toBe('error');
      expect(TYPE_ICON.info).toBe('info');
      expect(TYPE_ICON.success).toBe('done');
      expect(TYPE_ICON.warning).toBe('warning');

      dialogTypes.forEach(type => {
        expect(TYPE_ICON[type]).toBeDefined();
      });
    });
  });

  describe('TYPE_TITLE', () => {
    it('should map each DialogType to its corresponding general message title', () => {
      expect(TYPE_TITLE.error).toBe(GENERAL_MESSAGES.ERROR_TITLE);
      expect(TYPE_TITLE.info).toBe(GENERAL_MESSAGES.INFO_TITLE);
      expect(TYPE_TITLE.success).toBe(GENERAL_MESSAGES.SUCCESS_TITLE);
      expect(TYPE_TITLE.warning).toBe(GENERAL_MESSAGES.WARNING_TITLE);
    });
  });
});
