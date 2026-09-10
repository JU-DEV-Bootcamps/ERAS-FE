import { TestBed } from '@angular/core/testing';
import { CsvCheckerService } from './csv-checker.service';
import * as Papa from 'papaparse';

describe('CsvCheckerService', () => {
  let service: CsvCheckerService;

  const createMockFile = (csvContent: string, fileName = 'test.csv') => {
    return new File([csvContent], fileName, { type: 'text/csv' });
  };

  interface MockPapaConfig {
    complete?: (results: Papa.ParseResult<unknown>, file?: File) => void;
    error?: (error: Error, file?: File) => void;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Happy Path (Valid CSV)', () => {
    it('should parse and validate a correct CSV without errors', async () => {
      const validCsvContent = `Name,Email,SISId,EnrolledCourses,AverageScore\nJohn Doe,john@test.com,1001,5,95.5`;
      const file = createMockFile(validCsvContent);

      await service.validateCSV(file);

      expect(service.getErrors().length).toBe(0);
      expect(service.getSummarizedErrors().length).toBe(0);

      const data = service.getCSVData();
      expect(data.length).toBe(1);
      expect(data[0]['Name']).toBe('John Doe');
      expect(data[0]['AverageScore']).toBe('95.5');
    });

    it('should sanitize data (trim spaces in headers and values)', async () => {
      const csvContent = `Name,Email,SISId,EnrolledCourses,AverageScore\n John , john@test.com , 1001 , 5 , 95.5 `;
      const file = createMockFile(csvContent);

      await service.validateCSV(file);

      const data = service.getCSVData();
      expect(service.getErrors().length).toBe(0);
      expect(data[0]['Name']).toBe('John');
      expect(data[0]['Email']).toBe('john@test.com');
      expect(data[0]['SISId']).toBe('1001');
    });

    it('should accept numbers with comma in numeric fields', async () => {
      const csvContent = `Name,Email,SISId,AverageScore\nJohn,john@test.com,1001,"95,5"`;
      const file = createMockFile(csvContent);

      await service.validateCSV(file);

      expect(service.getErrors().length).toBe(0);
    });
  });

  describe('Validation Errors', () => {
    it('should detect missing required headers', async () => {
      const csvContent = `Name,Email\nJohn,john@test.com`;
      const file = createMockFile(csvContent);

      await service.validateCSV(file);

      const errors = service.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Missing headers: SISId');
      expect(service.getSummarizedErrors()[0]).toContain('missing headers');
    });

    it('should detect empty fields, invalid names, and invalid emails', async () => {
      const csvContent = `Name,Email,SISId\n,bad-email,1001`;
      const file = createMockFile(csvContent);

      await service.validateCSV(file);

      const errors = service.getErrors();
      expect(errors.length).toBe(1);

      const errorMsg = errors[0];
      expect(errorMsg).toContain('Row 1:');
      expect(errorMsg).toContain('Field Name is empty');
      expect(errorMsg).toContain('Invalid name format');
      expect(errorMsg).toContain('Invalid email format');
    });

    it('should detect non-numeric values in numeric fields', async () => {
      const csvContent = `Name,Email,SISId,EnrolledCourses\nJohn,john@test.com,1001,not-a-number`;
      const file = createMockFile(csvContent);

      await service.validateCSV(file);

      const errors = service.getErrors();
      expect(errors[0]).toContain('Field "EnrolledCourses" must be a number');
    });
  });

  describe('PapaParse & Parser Errors', () => {
    beforeEach(() => {
      spyOn(console, 'error');
    });

    it('should handle PapaParse errors when parsing fails (result.errors > 0)', async () => {
      spyOn(Papa, 'parse').and.callFake(((file: unknown, config: unknown) => {
        const papaConfig = config as MockPapaConfig;

        if (papaConfig.complete) {
          papaConfig.complete(
            {
              data: [],
              meta: {
                fields: [],
                delimiter: '',
                linebreak: '',
                aborted: false,
                truncated: false,
                cursor: 0,
              },
              errors: [
                {
                  row: 0,
                  message: 'Too many fields',
                  type: 'FieldMismatch',
                  code: 'TooManyFields',
                },
              ],
            },
            file as File
          );
        }

        return {
          data: [],
          errors: [],
          meta: {
            delimiter: '',
            linebreak: '',
            aborted: false,
            truncated: false,
            cursor: 0,
          },
        };
      }) as unknown as typeof Papa.parse);

      const file = createMockFile('');
      await service.validateCSV(file);

      const errors = service.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0]).toBe('Row 1: Too many fields');
      expect(service.getSummarizedErrors()[0]).toContain(
        'Failed to parse CSV file'
      );
    });

    it('should handle general exceptions during parsing', async () => {
      spyOn(Papa, 'parse').and.callFake(((file: unknown, config: unknown) => {
        const papaConfig = config as MockPapaConfig;

        if (papaConfig.error) {
          papaConfig.error(new Error('Network error'), file as File);
        }

        return {
          data: [],
          errors: [],
          meta: {
            delimiter: '',
            linebreak: '',
            aborted: false,
            truncated: false,
            cursor: 0,
          },
        };
      }) as unknown as typeof Papa.parse);

      const file = createMockFile('');
      await service.validateCSV(file);

      const errors = service.getErrors();
      expect(errors[0]).toBe('Network error');
      expect(service.getSummarizedErrors()[0]).toContain(
        'Failed to parse CSV file'
      );
    });
  });

  describe('Helper Getters', () => {
    it('should return errors by index', async () => {
      const csvContent = `Name,Email\nJohn,john@test.com`;
      const file = createMockFile(csvContent);

      await service.validateCSV(file);

      const firstError = service.getErrorsByIndex(0);
      const invalidIndex = service.getErrorsByIndex(99);

      expect(firstError).toContain('Missing headers');
      expect(invalidIndex).toBe('');
    });
  });
});
