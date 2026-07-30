import { InterventionMode } from '@core/models/assessment.model';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
];
export const ALLOWED_EXTENSIONS = '.pdf,.jpg,.png,.txt';
export const MAX_FILES = 5;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Group', label: 'Group' },
];

export const RISK_OPTIONS = [
  { value: 'Low', label: 'Low', color: 'success' },
  { value: 'Medium', label: 'Medium', color: 'warning' },
  { value: 'High', label: 'High', color: 'danger' },
];

export const STATUS_OPTIONS = [
  {
    value: 'Remitted',
    label: 'Remitted',
    allowed: ['Remitted'],
    colors: {
      label: '#333399',
      background: '#cdcde1',
    },
  },
  {
    value: 'InProgress',
    label: 'InProgress',
    allowed: ['Remitted', 'InProgress'],
    colors: {
      label: '#854d0e',
      background: '#fef9c3',
    },
  },
  {
    value: 'Finalized',
    label: 'Finalized',
    allowed: ['InProgress'],
    colors: {
      label: '#117473',
      background: '#afeae9',
    },
  },
];

export const ACTIVITY_OPTIONS = [
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'mentoring', label: 'Mentoring' },
];

export const AREA_OPTIONS = [
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'vocational', label: 'Vocational' },
];

export const MODE_OPTIONS = [
  { value: InterventionMode.InPlace, label: 'In place' },
  { value: InterventionMode.Remote, label: 'Remote' },
];

export interface StudentLookup {
  value: number;
  label: string;
  riskLevel?: number;
}
