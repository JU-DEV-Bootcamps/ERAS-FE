import { TestBed } from '@angular/core/testing';
import { CsvService } from './csv.service';
import { BaseExportService } from './base-export.service';
import { BreadcrumbsService } from '../breadcrumbs.service';

fdescribe('CsvService', () => {
  let service: CsvService;
  let baseExportServiceSpy: jasmine.SpyObj<BaseExportService>;
  let breadcrumbsServiceSpy: jasmine.SpyObj<BreadcrumbsService>;

  beforeEach(() => {
    baseExportServiceSpy = jasmine.createSpyObj('BaseExportService', [
      'downloadTextFile',
    ]);
    breadcrumbsServiceSpy = jasmine.createSpyObj('BreadcrumbsService', [
      'getLabels',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CsvService,
        { provide: BaseExportService, useValue: baseExportServiceSpy },
        { provide: BreadcrumbsService, useValue: breadcrumbsServiceSpy },
      ],
    });

    service = TestBed.inject(CsvService);
    // Override the inherited method with the spy
    (
      service as unknown as {
        downloadTextFile: typeof baseExportServiceSpy.downloadTextFile;
      }
    ).downloadTextFile = baseExportServiceSpy.downloadTextFile;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
