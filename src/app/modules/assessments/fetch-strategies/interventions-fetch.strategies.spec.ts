import {
  InterventionMode,
  InterventionModel,
  InterventionType,
} from '@core/models/assessment.model';
import { ERASRoles } from '@core/models/profile.model';
import { InterventionService } from '@core/services/api/intervention.service';

import { of } from 'rxjs';
import { InterventionsFetchStrategies } from './interventions-fetch.strategies';

describe('InterventionsFetchStrategies', () => {
  let mockService: jasmine.SpyObj<InterventionService>;

  const resultIntervention: InterventionModel = {
    assessmentId: 1,
    kind: InterventionType.Individual,
    mode: InterventionMode.InPlace,
    dateUtc: '2026-09-11T00:00:00Z',
    studentIds: [1, 2],
  };

  beforeEach(() => {
    mockService = jasmine.createSpyObj('InterventionService', [
      'getByAssessment',
      'getByAssessmentAndCreator',
      'getByAssessmentAndAssignedProfessional',
    ]);
  });

  describe(`${ERASRoles.ADMIN}`, () => {
    it('should call getByAssessment() with assessment ID', done => {
      mockService.getByAssessment.and.returnValue(of([resultIntervention]));

      const strategy = InterventionsFetchStrategies[ERASRoles.ADMIN];

      strategy(mockService, { assessmentId: 1 }).subscribe(result => {
        expect(mockService.getByAssessment).toHaveBeenCalled();
        expect(result).toEqual([resultIntervention]);
        done();
      });
    });

    it('should throw error if no context is provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.ADMIN];

      strategy(mockService).subscribe({
        error: err => {
          expect(err.message).toBe('Assessment ID not provided.');
          done();
        },
      });
    });

    it('should throw error if assessmentId not provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.ADMIN];

      strategy(mockService, { currentUserId: 'uuid-1' }).subscribe({
        error: err => {
          expect(err.message).toBe('Assessment ID not provided.');
          done();
        },
      });
    });
  });

  describe(`${ERASRoles.PROFESSIONAL}`, () => {
    it('should call getByAssessmentAndAssignedProfessional with provided user ID', done => {
      mockService.getByAssessmentAndAssignedProfessional.and.returnValue(
        of([resultIntervention])
      );

      const strategy = InterventionsFetchStrategies[ERASRoles.PROFESSIONAL];

      strategy(mockService, {
        currentUserId: 'uuid-1',
        assessmentId: 1,
      }).subscribe(result => {
        expect(
          mockService.getByAssessmentAndAssignedProfessional
        ).toHaveBeenCalled();
        expect(result).toEqual([resultIntervention]);
        done();
      });
    });

    it('should throw error if context not provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.PROFESSIONAL];

      strategy(mockService).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });

    it('should throw error if currentUserId not provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.PROFESSIONAL];

      strategy(mockService, { assessmentId: 1 }).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });

    it('should throw error if assessmentId not provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.PROFESSIONAL];

      strategy(mockService, { currentUserId: 'uuid-1' }).subscribe({
        error: err => {
          expect(err.message).toBe('Assessment ID not provided.');
          done();
        },
      });
    });
  });
  describe(`${ERASRoles.OFFICER}`, () => {
    it('should call getByAssessmentAndCreator with provided currentUserId and assessmentId', done => {
      mockService.getByAssessmentAndCreator.and.returnValue(
        of([resultIntervention])
      );

      const strategy = InterventionsFetchStrategies[ERASRoles.OFFICER];

      strategy(mockService, {
        currentUserId: 'uuid-1',
        assessmentId: 1,
      }).subscribe(result => {
        expect(mockService.getByAssessmentAndCreator).toHaveBeenCalled();
        expect(result).toEqual([resultIntervention]);
        done();
      });
    });

    it('should throw error if context not provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.OFFICER];

      strategy(mockService).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });

    it('should throw error if currentUserId not provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.OFFICER];

      strategy(mockService, { assessmentId: 1 }).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });

    it('should throw error if assessmentId not provided', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.OFFICER];

      strategy(mockService, { currentUserId: 'uuid-1' }).subscribe({
        error: err => {
          expect(err.message).toBe('Assessment ID not provided.');
          done();
        },
      });
    });
  });

  describe(`${ERASRoles.GUEST}`, () => {
    it('should throw error for non-authorized user', done => {
      const strategy = InterventionsFetchStrategies[ERASRoles.GUEST];

      strategy(mockService).subscribe({
        error: err => {
          expect(err.message).toBe('User not authorized.');
          done();
        },
      });
    });
  });
});
