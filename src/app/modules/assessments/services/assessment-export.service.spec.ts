import { TestBed } from '@angular/core/testing';
import Papa from 'papaparse';
import { AssessmentStatus } from '@core/models/assessment.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { AssessmentRowViewModel } from '../components/assessment-list/assessment-list.component';
import { TablePdfService } from '@core/services/exports/table-pdf.service';
import { AssessmentExportService } from './assessment-export.service';

interface AutoTableDoc {
  lastAutoTable: {
    body: unknown[];
    head: { cells: Record<string, { text: string[] }> }[];
    settings: { showHead: string };
  };
}

describe('AssessmentExportService', () => {
  let service: AssessmentExportService;
  let downloadSpy: jasmine.Spy;

  const buildRow = (
    overrides: Partial<AssessmentRowViewModel> = {}
  ): AssessmentRowViewModel => ({
    id: 1,
    createdAtUtc: '2026-03-05T12:00:00Z',
    createdBy: 'sub-1',
    service: 'psychology',
    assignedProfessionals: ['sub-2'],
    studentIds: ['1'],
    students: [{ id: 1, name: 'Ana Pérez', email: 'ana@mail.com' }],
    comments: 'A comment',
    status: AssessmentStatus.InProgress,
    interventions: [],
    studentDisplay: '1',
    commentPreview: 'A comment',
    isEditable: true,
    submitterDisplay: 'Laura Gómez',
    professionalDisplay: 'Carlos Díaz',
    ...overrides,
  });

  const manyRows = (count: number): AssessmentRowViewModel[] =>
    Array.from({ length: count }, (_, i) =>
      buildRow({ id: i + 1, comments: `Comment ${i + 1} `.repeat(20) })
    );

  const csvText = (): string => downloadSpy.calls.mostRecent().args[0];
  const csvTable = (): string[][] =>
    Papa.parse<string[]>(csvText().replace(/^\uFEFF/, '')).data.filter(
      r => r.length > 1
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserDataService,
          useValue: {
            user: () => ({ firstName: 'Laura', lastName: 'Gómez' }),
          },
        },
      ],
    });
    service = TestBed.inject(AssessmentExportService);
    downloadSpy = spyOn(service, 'downloadTextFile');
  });

  it('[678-export-assessments-list/AC-4] PDF table has all 100 rows', async () => {
    const doc = await service.buildPdf(manyRows(100));

    expect((doc as unknown as AutoTableDoc).lastAutoTable.body.length).toBe(
      100
    );
  });

  it('[678-export-assessments-list/AC-6] CSV and PDF headers match the table columns without Actions', async () => {
    const expected = [
      'Date',
      'Submitter',
      'Service',
      'Professional',
      'Student',
      'Status',
      'Comment',
    ];
    service.exportCsv([buildRow()]);
    const doc = await service.buildPdf([buildRow()]);

    expect(csvTable()[0]).toEqual(expected);
    const pdfHead = (doc as unknown as AutoTableDoc).lastAutoTable.head[0]
      .cells;
    expect(Object.values(pdfHead).map(cell => cell.text.join(''))).toEqual(
      expected
    );
  });

  it('[678-export-assessments-list/AC-7] cell values match what the table shows', () => {
    service.exportCsv([buildRow()]);

    expect(csvTable()[1]).toEqual([
      '03/05/2026',
      'Laura Gómez',
      'Psychology',
      'Carlos Díaz',
      'Ana Pérez',
      'In Progress',
      'A comment',
    ]);
  });

  it('[678-export-assessments-list/AC-8] comment is exported in full', () => {
    const longComment = 'c'.repeat(200);
    service.exportCsv([buildRow({ comments: longComment })]);

    const comment = csvTable()[1][6];
    expect(comment.length).toBe(200);
    expect(comment.endsWith('...')).toBeFalse();
  });

  it('[678-export-assessments-list/AC-9] student cell lists all names', () => {
    const students = ['Ana Pérez', 'Luis Mora', 'Eva Ríos', 'Tomás Vega'].map(
      (name, i) => ({ id: i + 1, name, email: `${i}@mail.com` })
    );
    service.exportCsv([buildRow({ students })]);

    expect(csvTable()[1][4]).toBe('Ana Pérez, Luis Mora, Eva Ríos, Tomás Vega');
  });

  it('[678-export-assessments-list/AC-10] CSV starts with a UTF-8 BOM and keeps accents', () => {
    service.exportCsv([
      buildRow({
        students: [{ id: 1, name: 'María Peña', email: 'm@mail.com' }],
        comments: 'Revisión académica',
      }),
    ]);

    expect(csvText().charCodeAt(0)).toBe(0xfeff);
    expect(csvText()).toContain('María Peña');
    expect(csvText()).toContain('Revisión académica');
  });

  it('[678-export-assessments-list/AC-11] commas, quotes and line breaks are escaped', () => {
    service.exportCsv([
      buildRow({ comments: 'Said "ok", then left\nNext step' }),
    ]);

    expect(csvText()).toContain('"Said ""ok"", then left\nNext step"');
    expect(csvTable().length).toBe(2);
  });

  it('[678-export-assessments-list/AC-12] formula-like cells get a leading single quote', () => {
    service.exportCsv([
      buildRow({ comments: '=SUM(A1:A9)' }),
      buildRow({ comments: '+1' }),
      buildRow({ comments: '-1' }),
      buildRow({ comments: '@cmd' }),
      buildRow({ comments: 'plain' }),
    ]);

    const comments = csvTable()
      .slice(1)
      .map(r => r[6]);
    expect(comments).toEqual(["'=SUM(A1:A9)", "'+1", "'-1", "'@cmd", 'plain']);
  });

  it('[678-export-assessments-list/AC-13] PDF shows title, date and time, user and filters', async () => {
    const buildSpy = spyOn(
      TestBed.inject(TablePdfService),
      'buildDocument'
    ).and.callThrough();
    await service.buildPdf([buildRow()]);

    const options = buildSpy.calls.mostRecent().args[0];
    expect(options.title).toBe('Assessments');
    expect(options.exportedAt).toBeTruthy();
    expect(options.exportedBy).toBe('Laura Gómez');
    expect(options.filtersText).toBe('None');
  });

  it('[678-export-assessments-list/AC-14] PDF has several pages and repeats headers', async () => {
    const doc = await service.buildPdf(manyRows(100));

    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expect(
      (doc as unknown as AutoTableDoc).lastAutoTable.settings.showHead
    ).toBe('everyPage');
  });
});
