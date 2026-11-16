import { TestBed } from '@angular/core/testing';
import { TablePdfOptions, TablePdfService } from './table-pdf.service';

describe('TablePdfService header lines', () => {
  let service: TablePdfService;

  const options = (bold?: boolean): TablePdfOptions => ({
    title: 'Report',
    headerLines: ['Type: Group', 'Filters:'],
    boldHeaderLabels: bold,
    columns: ['A'],
    rows: [['1']],
  });

  beforeEach(() => {
    service = TestBed.inject(TablePdfService);
  });

  it('prints the whole header line as one text when labels are not bold', async () => {
    const content = (await service.buildDocument(options())).output();

    expect(content).toContain('(Type: Group)');
  });

  it('prints the label of each header line apart, in bold, when asked', async () => {
    const content = (await service.buildDocument(options(true))).output();

    expect(content).toContain('(Type:)');
    expect(content).toContain('( Group)');
    expect(content).toContain('(Filters:)');
    expect(content).not.toContain('(Type: Group)');
  });
});
