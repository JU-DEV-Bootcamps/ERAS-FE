import { TestBed } from '@angular/core/testing';
import {
  AssessmentModel,
  AssessmentStatus,
  InterventionMode,
  InterventionStatus,
  InterventionType,
  RiskLevels,
} from '@core/models/assessment.model';
import { UserDataService } from '@core/services/access/user-data.service';
import {
  TablePdfOptions,
  TablePdfService,
} from '@core/services/exports/table-pdf.service';
import {
  AppliedFilter,
  FilterName,
} from '@shared/components/list-filters/models/list-filters.interface';
import { InterventionRowViewModel } from '../components/interventions/interventions-list/intervention-list.component';
import { InterventionExportService } from './intervention-export.service';

interface AutoTableDoc {
  lastAutoTable: {
    body: unknown[];
    settings: { showHead: string };
  };
}

describe('InterventionExportService', () => {
  let service: InterventionExportService;
  let buildSpy: jasmine.Spy;

  const buildRow = (
    overrides: Partial<InterventionRowViewModel> = {}
  ): InterventionRowViewModel =>
    ({
      id: 1,
      assessmentId: 10,
      kind: InterventionType.Individual,
      mode: InterventionMode.InPlace,
      status: InterventionStatus.InProgress,
      professional: 'Carlos Díaz',
      dateUtc: '2026-03-05T12:00:00Z',
      activity: 'workshop',
      comments: 'A comment',
      area: 'Academic',
      studentIds: [1],
      riskLevelName: RiskLevels.High,
      studentDisplay: [{ id: 1, name: 'Ana Pérez', email: 'ana@mail.com' }],
      commentPreview: 'A comment',
      ...overrides,
    }) as InterventionRowViewModel;

  const assessment = {
    id: 10,
    createdAtUtc: '2026-03-05T12:00:00Z',
    service: 'Psychology',
    status: AssessmentStatus.InProgress,
  } as AssessmentModel;

  const assessmentFilter: AppliedFilter = {
    name: FilterName.Assessment,
    value: 10,
  };

  const options = (): TablePdfOptions => buildSpy.calls.mostRecent().args[0];

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
    service = TestBed.inject(InterventionExportService);
    buildSpy = spyOn(
      TestBed.inject(TablePdfService),
      'buildDocument'
    ).and.callThrough();
  });

  it('[679-export-interventions-list/AC-8] PDF columns match the table without Actions', async () => {
    await service.buildPdf([buildRow()], [assessmentFilter], assessment);

    expect(options().columns).toEqual([
      'Date',
      'Type',
      'Mode',
      'Activity',
      'Professional',
      'Student',
      'Area',
      'Risk Level',
      'End Risk Level',
      'Status',
      'Comment',
    ]);
  });

  it('[679-export-interventions-list/AC-9] cell values match what the table shows', async () => {
    await service.buildPdf([buildRow()], [assessmentFilter], assessment);

    expect(options().rows[0]).toEqual([
      '03/05/2026',
      'Individual',
      'In-Place',
      'Workshop',
      'Carlos Díaz',
      'Ana Pérez',
      'Academic',
      'High',
      '—',
      'In Progress',
      'A comment',
    ]);
  });

  it('[679-export-interventions-list/AC-10] comment is exported in full', async () => {
    await service.buildPdf(
      [buildRow({ comments: 'c'.repeat(200) })],
      [assessmentFilter],
      assessment
    );

    const comment = options().rows[0][10];
    expect(comment.length).toBe(200);
    expect(comment.endsWith('...')).toBeFalse();
  });

  it('[679-export-interventions-list/AC-11] student cell lists all names', async () => {
    const students = ['Ana Pérez', 'Luis Mora', 'Eva Ríos', 'Tomás Vega'].map(
      (name, i) => ({ id: i + 1, name, email: `s${i}@mail.com` })
    );
    await service.buildPdf(
      [buildRow({ studentDisplay: students })],
      [assessmentFilter],
      assessment
    );

    expect(options().rows[0][5]).toBe(
      'Ana Pérez, Luis Mora, Eva Ríos, Tomás Vega'
    );
  });

  it('[679-export-interventions-list/AC-12] PDF shows title, date and time, user and applied filters', async () => {
    await service.buildPdf(
      [buildRow()],
      [
        assessmentFilter,
        { name: FilterName.Type, value: ['Group'] },
        { name: FilterName.Risk, value: ['High', 'Medium'] },
      ],
      assessment
    );

    const lines = options().headerLines.join('\n');
    expect(options().title).toBe('Interventions');
    expect(lines).toContain('Exported:');
    expect(lines).toContain('Exported by: Laura Gómez');
    expect(lines).toContain(
      'Assessment: 03/05/2026 – Psychology (In Progress)'
    );
    expect(lines).toContain('Type: Group');
    expect(lines).toContain('Risk Level: High, Medium');
  });

  it('[679-export-interventions-list/AC-13] filters without a selection are not listed', async () => {
    await service.buildPdf(
      [buildRow()],
      [
        assessmentFilter,
        { name: FilterName.Type, value: null },
        { name: FilterName.Status, value: [] },
      ],
      assessment
    );

    const lines = options().headerLines.join('\n');
    expect(lines).toContain(
      'Assessment: 03/05/2026 – Psychology (In Progress)'
    );
    expect(lines).not.toContain('Type');
    expect(lines).not.toContain('Status');
    expect(lines).not.toContain('Risk Level');
  });

  it('[679-export-interventions-list/AC-14] PDF has several pages and repeats headers', async () => {
    const rows = Array.from({ length: 100 }, (_, i) =>
      buildRow({ id: i + 1, comments: `Comment ${i + 1} `.repeat(10) })
    );

    const doc = await service.buildPdf(rows, [assessmentFilter], assessment);

    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    const table = (doc as unknown as AutoTableDoc).lastAutoTable;
    expect(table.body.length).toBe(100);
    expect(table.settings.showHead).toBe('everyPage');
  });

  it('[679-export-interventions-list/AC-15] accented characters reach the PDF unchanged', async () => {
    await service.buildPdf(
      [
        buildRow({
          activity: 'Sesión de orientación',
          comments: 'Revisión académica: año 1',
          studentDisplay: [{ id: 1, name: 'María Peña', email: 'm@mail.com' }],
        }),
      ],
      [assessmentFilter],
      assessment
    );

    const row = options().rows[0];
    expect(row).toContain('María Peña');
    expect(row).toContain('Revisión académica: año 1');
    expect(row.join(' ')).toContain('Sesión de orientación');
  });

  it('skips student names missing from the lookup and shows "—" when there are none', async () => {
    await service.buildPdf(
      [
        buildRow({
          studentDisplay: [
            undefined as unknown as { id: number; name: string; email: string },
          ],
        }),
        buildRow({ studentDisplay: 'No student assigned' }),
      ],
      [assessmentFilter],
      assessment
    );

    expect(options().rows.map(row => row[5])).toEqual(['—', '—']);
  });
});
