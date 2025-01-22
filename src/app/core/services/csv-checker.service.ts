import { Injectable } from '@angular/core';
import Papa from 'papaparse';

@Injectable({
  providedIn: 'root',
})
export class CsvCheckerService {
  expectedHeaders: string[] = [
    'Nombre',
    'Correo electronico',
    'Identificación de SIS del usuario',
    'Cursos inscritos:',
    'Cursos con nota:',
    'Entregas a tiempo en comparación con todas',
    'Puntuación media',
    'Cursos con una nota media por debajo de:',
    'Diferencia de la puntuación pura',
    'Diferencia de la puntuación estandarizada',
    'Días desde el último acceso',
  ];
  csvData: Record<string, unknown>[] = [];
  validationErrors: string[] = [];

  /**
   * The async keyword allows us to use the await keyword for the CSV parsing.
   * This also means that the function will return a Promise that resolves to void.
   */
  async validateCSV(csv: File): Promise<void> {
    try {
      const { data, fields } = await this.parseCSV(csv);
      this.csvData = data;
      this.validationErrors = this.validateData(data, fields);
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  }

  getErrors(): string[] {
    return this.validationErrors;
  }

  getCSVData(): Record<string, unknown>[] {
    return this.csvData;
  }

  /**
   * This function parses the CSV file using Papa.parse, which is an asynchronous operation.
   * We wrap it in a Promise to use async/await syntax for better readability and error handling
   */
  private async parseCSV(
    csv: File
  ): Promise<{ data: Record<string, unknown>[]; fields: string[] }> {
    return new Promise((resolve, reject) => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: result => {
          const data = result.data as Record<string, unknown>[];
          const fields = result.meta.fields || [];
          resolve({ data, fields });
        },
        error: error => {
          reject(error);
        },
      });
    });
  }

  private validateData(
    data: Record<string, unknown>[],
    headers: string[]
  ): string[] {
    this.validationErrors = [];
    this.validateHeaders(headers);
    if (this.validationErrors.length > 0) return this.validationErrors;
    this.validateRows(data);
    return this.validationErrors;
  }

  private validateHeaders(headers: string[]): void {
    const missingHeaders = this.expectedHeaders.filter(
      header => !headers.includes(header)
    );
    if (missingHeaders.length > 0) {
      this.validationErrors.push(
        `Missing headers: ${missingHeaders.join(', ')}`
      );
    }
  }

  private validateRows(data: Record<string, unknown>[]): void {
    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      const emailField = 'Correo electronico';

      if (!this.validateEmail(row[emailField])) {
        rowErrors.push('Invalid email format');
      }

      this.validateNumericFields(row, rowErrors);

      if (rowErrors.length > 0) {
        this.validationErrors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });
  }

  private validateNumericFields(
    row: Record<string, unknown>,
    rowErrors: string[]
  ): void {
    const numericFields = [
      'Cursos inscritos:',
      'Cursos con nota:',
      'Entregas a tiempo en comparación con todas',
      'Puntuación media',
      'Cursos con una nota media por debajo de:',
      'Diferencia de la puntuación pura',
      'Diferencia de la puntuación estandarizada',
      'Días desde el último acceso',
    ];
    numericFields.forEach(field => {
      if (!this.validateNumeric(row[field])) {
        rowErrors.push(`Field "${field}" must be a number`);
      }
    });
  }

  private validateEmail(email: unknown): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
  }

  private validateNumeric(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    const stringValue = value.toString().replace(',', '.');
    return !isNaN(Number(stringValue));
  }
}
