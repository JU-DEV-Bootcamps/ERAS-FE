import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import {
  isFieldEmailValid,
  isFieldNameValid,
} from '../utils/validators/fields.util';
import {
  isCSVParserError,
  CSVParserError,
} from '@core/utils/helpers/type-check';
@Injectable({
  providedIn: 'root',
})
export class CsvCheckerService {
  requiredHeaders: string[] = ['Name', 'Email', 'SISId', 'Id'];
  expectedHeaders: string[] = [
    ...this.requiredHeaders,
    'EnrolledCourses',
    'GradedCourses',
    'TimelySubmissions',
    'AverageScore',
    'CoursesBelowAverage',
    'RawScoreDifference',
    'StandardScoreDifference',
    'DaysSinceLastAccess',
  ];
  csvData: Record<string, string>[] = [];
  validationErrors: string[] = [];
  private summarizedValidationErrors: string[] = [];

  async validateCSV(csv: File): Promise<void> {
    try {
      const { data, fields } = await this.parseCSV(csv);
      this.csvData = data;
      this.validationErrors = this.validateData(data, fields);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to parse CSV file.';
      this.summarizedValidationErrors = [
        'Failed to parse CSV file. Please see the details.',
      ];
      this.validationErrors =
        Array.isArray(error) && isCSVParserError(error as object[])
          ? (error as CSVParserError[]).map(
              error => `Row ${error.row + 1}: ${error.message}`
            )
          : [message];
      console.error('Error parsing file:', error);
    }
  }

  getErrors(): string[] {
    return this.validationErrors;
  }

  getCSVData(): Record<string, string>[] {
    return this.csvData;
  }

  getSummarizedErrors(): string[] {
    return this.summarizedValidationErrors;
  }

  private async parseCSV(
    csv: File
  ): Promise<{ data: Record<string, string>[]; fields: string[] }> {
    return new Promise((resolve, reject) => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        encoding: 'UTF-8',
        complete: result => {
          if (result.errors.length > 0) {
            reject(result.errors.map(err => ({ ...err, parserError: true })));
            return;
          }
          const data = result.data as Record<string, string>[];
          const fields = result.meta.fields || [];
          const sanitizedData = this.sanitizeData(data);

          resolve({ data: sanitizedData, fields });
        },
        error: error => {
          reject(error);
        },
      });
    });
  }

  private validateData(
    data: Record<string, string>[],
    headers: string[]
  ): string[] {
    this.validationErrors = [];
    this.summarizedValidationErrors = [];

    this.validateHeaders(headers);
    if (this.validationErrors.length > 0) return this.validationErrors;

    this.validateRows(data);
    return this.validationErrors;
  }

  private validateHeaders(headers: string[]): void {
    const missingHeaders = this.requiredHeaders.filter(
      header => !headers.includes(header)
    );
    if (missingHeaders.length > 0) {
      this.summarizedValidationErrors.push(
        'There are missing headers. Please see the details.'
      );
      this.validationErrors.push(
        `Missing headers: ${missingHeaders.join(', ')}`
      );
      this.validationErrors.push(
        'Tip: If your file has headers, double-check that it is saved with UTF-8 encoding.'
      );
    }
  }

  private validateRows(data: Record<string, string>[]): void {
    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      const emailField = 'Email';
      const nameField = 'Name';

      Object.keys(row).forEach(field => {
        if (!row[field]) {
          rowErrors.push(`Field ${field} is empty`);
        }
      });

      if (!isFieldNameValid(row[nameField])) {
        rowErrors.push('Invalid name format');
      }
      if (!isFieldEmailValid(row[emailField])) {
        rowErrors.push('Invalid email format');
      }
      this.validateNumericFields(row, rowErrors);

      if (rowErrors.length > 0) {
        this.summarizedValidationErrors.push(
          `Row ${index + 1} has ${rowErrors.length} validation errors.`
        );
        this.validationErrors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });
  }

  private validateNumericFields(
    row: Record<string, unknown>,
    rowErrors: string[]
  ): void {
    const numericFields = [
      'EnrolledCourses',
      'GradedCourses',
      'TimelySubmissions',
      'AverageScore',
      'CoursesBelowAverage',
      'RawScoreDifference',
      'StandardScoreDifference',
      'DaysSinceLastAccess',
      'Id',
    ];
    numericFields.forEach(field => {
      if (!(field in row)) return;
      if (!this.validateNumeric(row[field])) {
        rowErrors.push(`Field "${field}" must be a number`);
      }
    });
  }

  private validateNumeric(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    const stringValue = value.toString().replace(',', '.');
    return !isNaN(Number(stringValue));
  }

  private sanitizeData(
    data: Record<string, string>[]
  ): Record<string, string>[] {
    const sanitizedData = [] as Record<string, string>[];

    data.forEach(row => {
      const pairs = Object.entries(row);
      const sanitizePairs = {} as Record<string, string>;

      pairs.forEach(([k, v]) => {
        sanitizePairs[k.trim()] = v.trim();
      });
      sanitizedData.push(sanitizePairs);
    });

    return sanitizedData;
  }
}
