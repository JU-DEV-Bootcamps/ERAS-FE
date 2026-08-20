import { TestBed } from '@angular/core/testing';
import { CsvService } from './csv.service';
import { ActivatedRoute } from '@angular/router';
import Papa from 'papaparse';
import { CSV_CONFIG } from '@core/constants/csv';
import { FileNameUtils } from '@core/utils/file/file-name';
import { BaseExportService } from './base-export.service';

describe('CsvService', () => {
  let service: CsvService;
  let downloadTextFileSpy: jasmine.Spy;
  let papaUnparseSpy: jasmine.Spy;
  let generateFileNameSpy: jasmine.Spy;

  const mockData = [{ id: 1, name: 'Test' }];
  const mockColumns = ['id', 'name'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();
    service = TestBed.inject(CsvService);
    downloadTextFileSpy = spyOn(
      BaseExportService.prototype,
      'downloadTextFile'
    );
    papaUnparseSpy = spyOn(Papa, 'unparse');
    generateFileNameSpy = spyOn(FileNameUtils, 'generateFileName');
  });

  afterEach(() => {
    downloadTextFileSpy.calls.reset();
    papaUnparseSpy.calls.reset();
    generateFileNameSpy.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call Papa.unparse with data and columns', () => {
    const parsedCSV = 'id,name\n1,Test\n';
    papaUnparseSpy.and.returnValue(parsedCSV);

    service.exportToCSV(mockData, mockColumns);

    expect(papaUnparseSpy).toHaveBeenCalledWith(
      { data: mockData },
      { ...CSV_CONFIG, columns: mockColumns }
    );
  });

  it('should call downloadTextFile with parsed CSV and generated filename when no fields provided', () => {
    const parsedCSV = 'id,name\n1,Test\n';
    const fileName = 'testPrefix_081926';

    papaUnparseSpy.and.returnValue(parsedCSV);
    generateFileNameSpy.and.returnValue(fileName);

    service.exportToCSV(mockData, mockColumns, undefined, 'testPrefix');

    expect(downloadTextFileSpy).toHaveBeenCalledWith(parsedCSV, fileName);
  });

  it('should call generateFileNameSpy with undefined when no filePrefix is provided', () => {
    const parsedCSV = 'id,name\n1,Test\n';
    papaUnparseSpy.and.returnValue(parsedCSV);
    generateFileNameSpy.and.returnValue('file_081926');

    service.exportToCSV(mockData, mockColumns);

    expect(generateFileNameSpy).toHaveBeenCalledWith(undefined);
  });

  it('should replace the first line with custom headers when fields are provided', () => {
    const parsedCsv = `id,name${CSV_CONFIG.newline}1,Test${CSV_CONFIG.newline}2,Other`;
    papaUnparseSpy.and.returnValue(parsedCsv);
    generateFileNameSpy.and.returnValue('file_081926');

    const fields = ['Identifier', 'Full Name'];
    const expectedHeaders = fields.join(',');
    const expectedCsv = `${expectedHeaders}${CSV_CONFIG.newline}1,Test${CSV_CONFIG.newline}2,Other`;

    service.exportToCSV(mockData, mockColumns, fields);

    expect(downloadTextFileSpy).toHaveBeenCalledWith(
      expectedCsv,
      'file_081926'
    );
  });
});
