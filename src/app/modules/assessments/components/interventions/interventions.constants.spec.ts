import { InterventionMode } from '@core/models/assessment.model';
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  TYPE_OPTIONS,
  RISK_OPTIONS,
  STATUS_OPTIONS,
  ACTIVITY_OPTIONS,
  AREA_OPTIONS,
  MODE_OPTIONS,
  getOptionLabel,
} from './interventions.constants';

describe('interventions.constants', () => {
  describe('ALLOWED_MIME_TYPES', () => {
    it('should include the expected mime types', () => {
      expect(ALLOWED_MIME_TYPES).toEqual([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'text/plain',
      ]);
    });

    it('should have 4 entries', () => {
      expect(ALLOWED_MIME_TYPES.length).toBe(4);
    });
  });

  describe('ALLOWED_EXTENSIONS', () => {
    it('should match the expected comma-separated extension string', () => {
      expect(ALLOWED_EXTENSIONS).toBe('.pdf,.jpg,.png,.txt');
    });

    it('should contain one extension per allowed mime type', () => {
      const extensions = ALLOWED_EXTENSIONS.split(',');
      expect(extensions.length).toBe(ALLOWED_MIME_TYPES.length);
    });
  });

  describe('MAX_FILES', () => {
    it('should be 5', () => {
      expect(MAX_FILES).toBe(5);
    });
  });

  describe('MAX_FILE_SIZE_BYTES', () => {
    it('should equal 10 MB in bytes', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });
  });

  describe('TYPE_OPTIONS', () => {
    it('should contain Individual and Group options', () => {
      expect(TYPE_OPTIONS).toEqual([
        { value: 'Individual', label: 'Individual' },
        { value: 'Group', label: 'Group' },
      ]);
    });
  });

  describe('RISK_OPTIONS', () => {
    it('should contain Low, Medium and High with their colors', () => {
      expect(RISK_OPTIONS).toEqual([
        { value: 'Low', label: 'Low', color: 'success' },
        { value: 'Medium', label: 'Medium', color: 'warning' },
        { value: 'High', label: 'High', color: 'danger' },
      ]);
    });

    it('should have a unique color per risk level', () => {
      const colors = RISK_OPTIONS.map(option => option.color);
      expect(new Set(colors).size).toBe(RISK_OPTIONS.length);
    });
  });

  describe('STATUS_OPTIONS', () => {
    it('should define Remitted, InProgress and Finalized statuses', () => {
      const values = STATUS_OPTIONS.map(option => option.value);
      expect(values).toEqual(['Remitted', 'InProgress', 'Finalized']);
    });

    it('should only allow Remitted as its own predecessor', () => {
      const remitted = STATUS_OPTIONS.find(
        option => option.value === 'Remitted'
      );
      expect(remitted?.allowed).toEqual(['Remitted']);
    });

    it('should allow InProgress to follow Remitted or itself', () => {
      const inProgress = STATUS_OPTIONS.find(
        option => option.value === 'InProgress'
      );
      expect(inProgress?.allowed).toEqual(['Remitted', 'InProgress']);
    });

    it('should only allow Finalized to follow InProgress', () => {
      const finalized = STATUS_OPTIONS.find(
        option => option.value === 'Finalized'
      );
      expect(finalized?.allowed).toEqual(['InProgress']);
    });

    it('should define label and background colors for every status', () => {
      STATUS_OPTIONS.forEach(option => {
        expect(option.colors.label).toBeTruthy();
        expect(option.colors.background).toBeTruthy();
      });
    });
  });

  describe('ACTIVITY_OPTIONS', () => {
    it('should contain the four expected activity types', () => {
      expect(ACTIVITY_OPTIONS.map(option => option.value)).toEqual([
        'tutoring',
        'counseling',
        'workshop',
        'mentoring',
      ]);
    });
  });

  describe('AREA_OPTIONS', () => {
    it('should contain the four expected area types', () => {
      expect(AREA_OPTIONS.map(option => option.value)).toEqual([
        'academic',
        'social',
        'emotional',
        'vocational',
      ]);
    });
  });

  describe('MODE_OPTIONS', () => {
    it('should map InterventionMode enum values to labels', () => {
      expect(MODE_OPTIONS).toEqual([
        { value: InterventionMode.InPlace, label: 'In place' },
        { value: InterventionMode.Remote, label: 'Remote' },
      ]);
    });
  });

  describe('getOptionLabel', () => {
    it('should return the label for a matching value', () => {
      expect(getOptionLabel(RISK_OPTIONS, 'Medium')).toBe('Medium');
      expect(getOptionLabel(ACTIVITY_OPTIONS, 'tutoring')).toBe('Tutoring');
    });

    it('should return the raw value when no option matches', () => {
      expect(getOptionLabel(ACTIVITY_OPTIONS, 'unknown-value')).toBe(
        'unknown-value'
      );
    });

    it('should return an empty string for null', () => {
      expect(getOptionLabel(ACTIVITY_OPTIONS, null)).toBe('');
    });

    it('should return an empty string for undefined', () => {
      expect(getOptionLabel(ACTIVITY_OPTIONS, undefined)).toBe('');
    });

    it('should return an empty string for an empty string value', () => {
      expect(getOptionLabel(ACTIVITY_OPTIONS, '')).toBe('');
    });

    it('should work against an empty options array', () => {
      expect(getOptionLabel([], 'anything')).toBe('anything');
    });
  });
});
