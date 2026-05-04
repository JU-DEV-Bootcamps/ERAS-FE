import { ImportModalConfig } from '@core/models/import-modal-config.model';

export const CSV_IMPORT_CONFIG: ImportModalConfig = {
  title: 'Import Students',
  acceptedMimeType: 'text/csv',
  acceptedExtensionLabel: '(.csv)',
  maxFileSizeBytes: 5 * 1024 * 1024,
  description:
    'Import a CSV file with the following characteristics. It must have columns' +
    ' with Name, Email, SIS Id, Enrolled courses, Graded courses, Timely submissions,' +
    ' average score, Courses below average, Raw score difference, Standard score' +
    ' difference, days since last access.',
  templateUrl: '/assets/example_files/import_student_example.csv',
  templateLabel: 'example template',
};
