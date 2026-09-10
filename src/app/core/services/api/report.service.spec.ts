import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { ApiResponse } from '../../models/api-response.model';
import {
  CountSummaryModel,
  GetQueryResponse,
  PollAvgReport,
  PollCountComponent,
  PollCountReport,
  StudentReportAnswerRiskLevel,
} from '../../models/summary.model';
import { RiskCountReport } from '../../models/common/risk.model';
import {
  DynamicReport,
  SummaryReport,
} from '../../models/reports/reports-data.model';
import { ComponentValueType } from '../../models/types/risk-students-detail.type';
import { Pagination } from '../interfaces/server.type';
import { PagedResult } from '../interfaces/page.type';
import { environment } from '../../../../environments/environment';
import { RISK_COLORS, RISK_LEVEL } from '../../constants/riskLevel';
import { fixedColorRange } from '@core/utils/apex-chart/chart.constants';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/reports`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportService],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCountSummary', () => {
    it('should make a GET request to count', () => {
      const mockResponse = {} as ApiResponse<CountSummaryModel>;

      service.getCountSummary().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/count`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopPollReport', () => {
    it('should send variableIds joined by comma, PageSize and Page', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 } as Pagination;
      const mockResponse = {} as ApiResponse<
        PagedResult<StudentReportAnswerRiskLevel>
      >;

      service
        .getTopPollReport([1, 2, 3], 'poll-1', pagination)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/poll-1/top` &&
          r.params.get('variableIds') === '1,2,3' &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should send a single variableId without commas', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 } as Pagination;

      service.getTopPollReport([5], 'poll-1', pagination).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/poll-1/top` &&
          r.params.get('variableIds') === '5'
      );
      req.flush({});
    });
  });

  describe('getAvgPoolReport', () => {
    it('should always send lastVersion', () => {
      const mockResponse = {} as GetQueryResponse<PollAvgReport>;

      service
        .getAvgPoolReport('instance-1', [], true)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/avg` &&
          r.params.get('lastVersion') === 'true' &&
          !r.params.has('cohortIds') &&
          !r.params.has('evaluationId')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include cohortIds when the array is not empty', () => {
      service.getAvgPoolReport('instance-1', [1, 2], true).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/avg` &&
          r.params.get('cohortIds') === '1,2'
      );
      req.flush({});
    });

    it('should not include cohortIds when the array is empty', () => {
      service.getAvgPoolReport('instance-1', [], true).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/avg` &&
          !r.params.has('cohortIds')
      );
      req.flush({});
    });

    it('should include evaluationId when truthy', () => {
      service.getAvgPoolReport('instance-1', [], true, 42).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/avg` &&
          r.params.get('evaluationId') === '42'
      );
      req.flush({});
    });

    it('should NOT include evaluationId when it is 0 (falsy check)', () => {
      service.getAvgPoolReport('instance-1', [], true, 0).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/avg` &&
          !r.params.has('evaluationId')
      );
      req.flush({});
    });
  });

  describe('getCountPoolReport', () => {
    it('should return of(null) and not call the API when variableIds is empty', done => {
      service.getCountPoolReport('instance-1', null, []).subscribe(res => {
        expect(res).toBeNull();
        done();
      });

      httpMock.expectNone(`${baseUrl}/polls/instance-1/count`);
    });

    it('should return of(null) and not call the API when variableIds is null/undefined', done => {
      service
        .getCountPoolReport('instance-1', null, null as unknown as number[])
        .subscribe(res => {
          expect(res).toBeNull();
          done();
        });

      httpMock.expectNone(`${baseUrl}/polls/instance-1/count`);
    });

    it('should send variableIds and always send lastVersion=true', () => {
      const mockResponse = {} as GetQueryResponse<PollCountReport>;

      service
        .getCountPoolReport('instance-1', null, [1, 2])
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/count` &&
          r.params.get('variableIds') === '1,2' &&
          r.params.get('lastVersion') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include cohortIds when not null', () => {
      service.getCountPoolReport('instance-1', [7, 8], [1]).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/count` &&
          r.params.get('cohortIds') === '7,8'
      );
      req.flush({});
    });

    it('should not include cohortIds when null', () => {
      service.getCountPoolReport('instance-1', null, [1]).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/count` &&
          !r.params.has('cohortIds')
      );
      req.flush({});
    });

    it('should include cohortIds when it is an empty array (unlike null)', () => {
      service.getCountPoolReport('instance-1', [], [1]).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/count` &&
          r.params.has('cohortIds')
      );
      req.flush({});
    });

    it('should include evaluationId when truthy', () => {
      service.getCountPoolReport('instance-1', null, [1], 99).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/count` &&
          r.params.get('evaluationId') === '99'
      );
      req.flush({});
    });

    it('should NOT include evaluationId when it is 0 (falsy check)', () => {
      service.getCountPoolReport('instance-1', null, [1], 0).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/instance-1/count` &&
          !r.params.has('evaluationId')
      );
      req.flush({});
    });
  });

  describe('getRiskCountPollReport', () => {
    it('should make a GET request to polls/:pollUuiD/risk-count', () => {
      const mockResponse = {} as ApiResponse<RiskCountReport>;

      service.getRiskCountPollReport('poll-1').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/polls/poll-1/risk-count`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('addAnswerSeparator', () => {
    it('should insert " - " before each uppercase letter except the first character', () => {
      expect(service.addAnswerSeparator('CamelCaseText')).toBe(
        'Camel - Case - Text'
      );
    });

    it('should return the string unchanged when there are no internal uppercase letters', () => {
      expect(service.addAnswerSeparator('lowercase')).toBe('lowercase');
    });

    it('should not add a separator before the first character even if uppercase', () => {
      expect(service.addAnswerSeparator('Single')).toBe('Single');
    });
  });

  describe('getHMSeriesFromAvgReport', () => {
    const buildReport = (): PollAvgReport => ({
      pollCount: 2,
      components: [
        {
          description: 'academico',
          averageRisk: 2.456,
          questions: [
            {
              question: 'Q1',
              averageRisk: 3,
              position: 1,
              averageAnswer: 'Answer 1',
              answersDetails: [
                {
                  answerText: 'Yes',
                  answerPercentage: 60,
                  studentsEmails: ['a@x.com'],
                },
                {
                  answerText: 'No',
                  answerPercentage: 40,
                  studentsEmails: ['b@x.com'],
                },
              ],
            },
            {
              question: 'Q2',
              averageRisk: 1,
              position: 2,
              averageAnswer: 'Answer 2',
              answersDetails: [
                {
                  answerText: 'Maybe',
                  answerPercentage: 100,
                  studentsEmails: ['c@x.com'],
                },
              ],
            },
          ],
        },
        {
          description: 'individual',
          averageRisk: 0.5,
          questions: [
            {
              question: 'Q3',
              averageRisk: 5,
              position: 1,
              averageAnswer: 'Answer 3',
              answersDetails: [],
            },
          ],
        },
      ],
    });

    it('should map each component to a serie with text/description/name', () => {
      const result = service.getHMSeriesFromAvgReport(buildReport());

      expect(result.length).toBe(2);
      expect(result[0].description).toBe('academico');
      expect(result[0].name).toBe('academico');
      expect(result[0].text).toBe('academico\n RISK AVG: 2.46');
    });

    it('should map each question to a data point with x/y/z/position', () => {
      const result = service.getHMSeriesFromAvgReport(buildReport());

      const q2 = result[0].data.find(d => d.x === 'Q2');
      expect(q2).toEqual({
        x: 'Q2',
        y: 1,
        z: [
          {
            answerText: 'Maybe',
            answerPercentage: 100,
            studentsEmails: ['c@x.com'],
          },
        ],
        position: 2,
      });
    });

    it('should sort each serie data ascending by averageRisk (y)', () => {
      const result = service.getHMSeriesFromAvgReport(buildReport());

      const ys = result[0].data.map(d => d.y);
      expect(ys).toEqual([1, 3]);
    });

    it('should return an empty data array for a component with no questions', () => {
      const report = buildReport();
      report.components[1].questions = [];

      const result = service.getHMSeriesFromAvgReport(report);

      expect(result[1].data).toEqual([]);
    });

    it('should return an empty array when there are no components', () => {
      const report: PollAvgReport = { pollCount: 0, components: [] };

      const result = service.getHMSeriesFromAvgReport(report);

      expect(result).toEqual([]);
    });
  });

  describe('getHMSeriesFromCountReport', () => {
    const buildReport = (): PollCountReport => ({
      components: [
        {
          description: 'academico',
          text: 'Academico',
          questions: [
            {
              question: 'Q1',
              averageRisk: 2,
              position: 1,
              answers: [
                { answerText: 'Yes', answerRisk: 1, count: 3, students: [] },
                { answerText: 'No', answerRisk: 2, count: 5, students: [] },
              ],
            },
          ],
        },
        {
          description: 'individual',
          text: 'Individual',
          questions: [
            {
              question: 'Q2',
              averageRisk: 0,
              position: 1,
              answers: [
                { answerText: 'Maybe', answerRisk: 0, count: 1, students: [] },
              ],
            },
          ],
        },
      ],
    });

    it('should flatten questions across all components', () => {
      const result = service.getHMSeriesFromCountReport(buildReport());

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Q1');
      expect(result[1].name).toBe('Q2');
    });

    it('should map each answer to x/y/z', () => {
      const result = service.getHMSeriesFromCountReport(buildReport());

      expect(result[0].data).toEqual([
        { x: 1, y: 1, z: '3 answers with risk 1 for: Yes' },
        { x: 2, y: 2, z: '5 answers with risk 2 for: No' },
      ]);
    });

    it('should return an empty array when there are no components', () => {
      const report: PollCountReport = { components: [] };

      const result = service.getHMSeriesFromCountReport(report);

      expect(result).toEqual([]);
    });
  });

  describe('getHMSeriesFromCountComponent', () => {
    // Q-first: answerRisk 1.6 and 2.4 both fall in real risk group 2
    // (1.5 <= x < 2.5), so they should merge under getRiskGroup's real logic.
    const buildComponent = (): PollCountComponent => ({
      description: 'academico',
      text: 'Academico',
      questions: [
        {
          question: 'Q-first',
          averageRisk: 2,
          position: 1,
          answers: [
            {
              answerText: 'Yes',
              answerRisk: 1.6,
              count: 2,
              students: [
                {
                  answerText: 'Yes',
                  name: 'Alice',
                  email: 'a@x.com',
                  cohortId: 1,
                  cohortName: 'Cohort A',
                },
              ],
            },
            {
              answerText: 'No',
              answerRisk: 2.4,
              count: 3,
              students: [
                {
                  answerText: 'No',
                  name: 'Bob',
                  email: 'b@x.com',
                  cohortId: 1,
                  cohortName: 'Cohort A',
                },
              ],
            },
          ],
        },
        {
          question: 'Q-second',
          averageRisk: 5,
          position: 2,
          answers: [
            {
              answerText: 'Maybe',
              answerRisk: 5,
              count: 1,
              students: [
                {
                  answerText: 'Maybe',
                  name: 'Carol',
                  email: 'c@x.com',
                  cohortId: 2,
                  cohortName: 'Cohort B',
                },
              ],
            },
          ],
        },
      ],
    });

    // NOTE: getRiskGroup and addCountPercentages are used for real here —
    // spyOn on these namespace exports fails under this project's build
    // ("is not declared writable"), so instead the fixtures are crafted to
    // exercise the real risk-grouping thresholds directly.

    it('should sort questions by position descending', () => {
      const result = service.getHMSeriesFromCountComponent(buildComponent());

      expect(result[0].name).toBe('Q-second');
      expect(result[1].name).toBe('Q-first');
    });

    it('should merge answers that fall into the same real risk group and sum their counts', () => {
      const result = service.getHMSeriesFromCountComponent(buildComponent());
      const qFirst = result.find(r => r.name === 'Q-first');

      // 1.6 and 2.4 both map to risk group 2 under getRiskGroup's real thresholds.
      expect(qFirst?.data.length).toBe(1);
      expect(qFirst?.data[0].count).toBe(5); // 2 + 3 merged
    });

    it('should build z as the joined list of student emails for the answer', () => {
      const result = service.getHMSeriesFromCountComponent(buildComponent());
      const qSecond = result.find(r => r.name === 'Q-second');

      expect(qSecond?.data[0].z).toBe('c@x.com');
    });

    it('should return an empty data array for a question with no answers', () => {
      const component = buildComponent();
      component.questions[1].answers = [];

      const result = service.getHMSeriesFromCountComponent(component);
      const qSecond = result.find(r => r.name === 'Q-second');

      expect(qSecond?.data).toEqual([]);
    });
  });

  describe('getBMSeriesFromSummaryReport', () => {
    it('should order risks ascending by endRange and map levels/colors from RISK_LEVEL/RISK_COLORS', () => {
      const endRanges = Object.keys(RISK_LEVEL)
        .map(Number)
        .filter(n => !Number.isNaN(n))
        .sort((a, b) => a - b);
      expect(endRanges.length).toBeGreaterThanOrEqual(2);

      const [low, high] = endRanges;
      const report: RiskCountReport = {
        averageRisk: 2.5,
        answerCount: 15,
        risks: [
          { label: 'High label', startRange: 4.5, endRange: high, count: 10 },
          { label: 'Low label', startRange: -1, endRange: low, count: 5 },
        ],
      };

      const result = service.getBMSeriesFromSummaryReport(report);

      expect(result.risks).toEqual([5, 10]);
      expect(result.levels).toEqual([
        `${RISK_LEVEL[low]} Low label`,
        `${RISK_LEVEL[high]} High label`,
      ]);
      expect(result.colors).toEqual([RISK_COLORS[low], RISK_COLORS[high]]);
    });
  });

  describe('getColorKey', () => {
    it('should return the color of the range that contains the value', () => {
      const range = fixedColorRange.find(r => r.from < r.to);
      if (!range) {
        fail(
          'fixedColorRange has no usable non-degenerate range for this test'
        );
        return;
      }

      expect(service.getColorKey(range.from)).toBe(range.color);
    });

    it('should return the default color when no range matches', () => {
      const minFrom = Math.min(...fixedColorRange.map(r => r.from));

      expect(service.getColorKey(minFrom - 1)).toBe('#000000');
    });
  });

  describe('regroupSummaryByColor', () => {
    // Use the midpoint of a range, NOT range.from: the first entry in
    // fixedColorRange starts at -1, which is the exact sentinel value the
    // service uses internally to mark filler points (`y: -1`). Reusing it
    // in fixture data makes real points indistinguishable from fillers.
    const sampleValue = () => {
      const range = fixedColorRange.find(r => r.from < r.to);
      if (!range) throw new Error('fixedColorRange has no usable range');
      return (range.from + range.to) / 2;
    };

    const buildRow = (
      name: ComponentValueType,
      data: SummaryReport['data']
    ): SummaryReport => ({
      description: name,
      name,
      text: name,
      data,
    });

    it('should preserve the number of rows', () => {
      const rows: SummaryReport[] = [
        buildRow('academico', [{ x: 'q1', y: sampleValue(), z: [] }]),
      ];

      const result = service.regroupSummaryByColor(rows);

      expect(result.length).toBe(1);
    });

    it('should not add fillers when there is only one row', () => {
      const y = sampleValue();
      const rows: SummaryReport[] = [
        buildRow('academico', [
          { x: 'q1', y, z: [] },
          { x: 'q2', y, z: [] },
        ]),
      ];

      const result = service.regroupSummaryByColor(rows);

      expect(result[0].data.filter(d => d.y === -1).length).toBe(0);
      expect(result[0].data.filter(d => d.y !== -1).length).toBe(2);
    });

    it('should pad every row to the same total length', () => {
      const y = sampleValue();
      const rows: SummaryReport[] = [
        buildRow('academico', [
          { x: 'q1', y, z: [] },
          { x: 'q2', y, z: [] },
          { x: 'q3', y, z: [] },
        ]),
        buildRow('individual', [{ x: 'q1', y, z: [] }]),
      ];

      const result = service.regroupSummaryByColor(rows);

      expect(result[0].data.length).toBe(result[1].data.length);

      const rowIndividual = result.find(r => r.name === 'individual');
      expect(rowIndividual?.data.filter(d => d.y === -1)).toEqual([
        { x: '', y: -1, z: [] },
        { x: '', y: -1, z: [] },
      ]);
    });

    it('should not mutate the input array (returns a new array)', () => {
      const rows: SummaryReport[] = [
        buildRow('academico', [{ x: 'q1', y: sampleValue(), z: [] }]),
      ];

      const result = service.regroupSummaryByColor(rows);

      expect(result).not.toBe(rows);
    });
  });

  describe('regroupDynamicByColor', () => {
    // Same midpoint reasoning as regroupSummaryByColor above.
    const sampleValue = () => {
      const range = fixedColorRange.find(r => r.from < r.to);
      if (!range) throw new Error('fixedColorRange has no usable range');
      return (range.from + range.to) / 2;
    };

    it('should preserve the number of rows', () => {
      const rows: DynamicReport[] = [
        { name: 'Row A', data: [{ x: 1, y: sampleValue(), z: 'meta' }] },
      ];

      const result = service.regroupDynamicByColor(rows);

      expect(result.length).toBe(1);
    });

    it('should keep the original item recognizable among any fillers', () => {
      const y = sampleValue();
      const rows: DynamicReport[] = [
        { name: 'Row A', data: [{ x: 1, y, z: 'meta' }] },
      ];

      const result = service.regroupDynamicByColor(rows);
      const nonFillers = result[0].data.filter(d => d.y !== -1);

      expect(nonFillers.length).toBe(1);
      expect(nonFillers[0].x).toBe(1);
    });

    it('should pad every row to the same total length', () => {
      const y = sampleValue();
      const rows: DynamicReport[] = [
        {
          name: 'Row A',
          data: [
            { x: 1, y, z: 'meta' },
            { x: 2, y, z: 'meta' },
          ],
        },
        { name: 'Row B', data: [{ x: 1, y, z: 'meta' }] },
      ];

      const result = service.regroupDynamicByColor(rows);

      expect(result[0].data.length).toBe(result[1].data.length);
    });
  });
});
