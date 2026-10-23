import { EvaluationModel } from '@core/models/evaluation.model';
import {
  getEvalClass,
  getStatusForEvaluationProcess,
} from './evaluations.util';

describe('Evaluations Util', () => {
  const buildEvaluation = (
    overrides: Partial<EvaluationModel> = {}
  ): EvaluationModel =>
    ({
      id: 1,
      name: 'Evaluation Test',
      pollName: 'Poll Name Test',
      status: 'Started',
      startDate: new Date('2026-09-10T00:00:00Z'),
      endDate: new Date('2026-09-20T00:00:00Z'),
      country: 'BO',
      polls: [],
      pollInstances: [],
      ...overrides,
    }) as EvaluationModel;

  describe('getStatusForEvaluationProcess', () => {
    describe('Incomplete branches', () => {
      it('should return "Incomplete" when pollName is null', () => {
        const evaluation = buildEvaluation({
          pollName: null as unknown as string,
        });
        expect(getStatusForEvaluationProcess(evaluation)).toBe('Incomplete');
      });

      it('should return "Incomplete" when pollName is undefined', () => {
        const evaluation = buildEvaluation({
          pollName: undefined as unknown as string,
        });
        expect(getStatusForEvaluationProcess(evaluation)).toBe('Incomplete');
      });

      it('should return "Incomplete" when pollName is an empty string', () => {
        const evaluation = buildEvaluation({ pollName: '' });
        expect(getStatusForEvaluationProcess(evaluation)).toBe('Incomplete');
      });

      it('should return "Incomplete" when status is already "Incomplete"', () => {
        const evaluation = buildEvaluation({ status: 'Incomplete' });
        expect(getStatusForEvaluationProcess(evaluation)).toBe('Incomplete');
      });
    });

    describe('Date-based status branches', () => {
      beforeEach(() => {
        jasmine.clock().install();
      });

      afterEach(() => {
        jasmine.clock().uninstall();
      });

      it('should return "Not started yet" when current time is before startDate', () => {
        jasmine.clock().mockDate(new Date('2026-09-09T12:00:00Z'));

        const evaluation = buildEvaluation({
          startDate: new Date('2026-09-10T00:00:00Z'),
          endDate: new Date('2026-09-20T00:00:00Z'),
        });

        expect(getStatusForEvaluationProcess(evaluation)).toBe(
          'Not started yet'
        );
      });

      it('should return "In progress" when current time is exactly startDate', () => {
        jasmine.clock().mockDate(new Date('2026-09-10T00:00:00Z'));

        const evaluation = buildEvaluation({
          startDate: new Date('2026-09-10T00:00:00Z'),
          endDate: new Date('2026-09-20T00:00:00Z'),
        });

        expect(getStatusForEvaluationProcess(evaluation)).toBe('In progress');
      });

      it('should return "In progress" when current time is between startDate and endDate', () => {
        jasmine.clock().mockDate(new Date('2026-09-15T12:00:00Z'));

        const evaluation = buildEvaluation({
          startDate: new Date('2026-09-10T00:00:00Z'),
          endDate: new Date('2026-09-20T00:00:00Z'),
        });

        expect(getStatusForEvaluationProcess(evaluation)).toBe('In progress');
      });

      it('should return "Finished" when current time is exactly endDate', () => {
        jasmine.clock().mockDate(new Date('2026-09-20T00:00:00Z'));

        const evaluation = buildEvaluation({
          startDate: new Date('2026-09-10T00:00:00Z'),
          endDate: new Date('2026-09-20T00:00:00Z'),
        });

        expect(getStatusForEvaluationProcess(evaluation)).toBe('Finished');
      });

      it('should return "Finished" when current time is after endDate', () => {
        jasmine.clock().mockDate(new Date('2026-09-25T12:00:00Z'));

        const evaluation = buildEvaluation({
          startDate: new Date('2026-09-10T00:00:00Z'),
          endDate: new Date('2026-09-20T00:00:00Z'),
        });

        expect(getStatusForEvaluationProcess(evaluation)).toBe('Finished');
      });
    });
  });

  describe('getEvalClass', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should replace spaces with underscores for "Not started yet"', () => {
      jasmine.clock().mockDate(new Date('2026-09-01T00:00:00Z'));
      const evaluation = buildEvaluation({
        startDate: new Date('2026-09-10T00:00:00Z'),
        endDate: new Date('2026-09-20T00:00:00Z'),
      });

      expect(getEvalClass(evaluation)).toBe('Not_started_yet');
    });

    it('should replace spaces with underscores for "In progress"', () => {
      jasmine.clock().mockDate(new Date('2026-09-15T00:00:00Z'));
      const evaluation = buildEvaluation({
        startDate: new Date('2026-09-10T00:00:00Z'),
        endDate: new Date('2026-09-20T00:00:00Z'),
      });

      expect(getEvalClass(evaluation)).toBe('In_progress');
    });

    it('should return unchanged status without spaces like "Incomplete"', () => {
      const evaluation = buildEvaluation({ pollName: '' });
      expect(getEvalClass(evaluation)).toBe('Incomplete');
    });

    it('should return unchanged status without spaces like "Finished"', () => {
      jasmine.clock().mockDate(new Date('2026-09-25T00:00:00Z'));
      const evaluation = buildEvaluation({
        startDate: new Date('2026-09-10T00:00:00Z'),
        endDate: new Date('2026-09-20T00:00:00Z'),
      });

      expect(getEvalClass(evaluation)).toBe('Finished');
    });
  });
});
