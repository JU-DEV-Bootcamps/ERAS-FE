import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { ERASRoles } from '@core/models/profile.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { AssessmentFetchStrategies } from './assessments-fetch.strategies';
import { of } from 'rxjs';

describe('AssessmentFetchStrategies', () => {
  let mockService: jasmine.SpyObj<AssessmentService>;
  const expectedAssessment: AssessmentModel = {
    createdAtUtc: '2026-09-11T00:00:00>',
    createdBy: 'TestUser',
    service: 'Test Service',
    studentIds: ['1', '2'],
    status: AssessmentStatus.Remitted,
    interventions: [],
  };

  beforeEach(() => {
    mockService = jasmine.createSpyObj('AssessmentService', [
      'getAll',
      'getByProfessional',
      'getByCreator',
    ]);
  });

  describe(`${ERASRoles.ADMIN}`, () => {
    it('should call getAll() regardless of context', done => {
      mockService.getAll.and.returnValue(of([expectedAssessment]));

      const strategy = AssessmentFetchStrategies[ERASRoles.ADMIN];

      strategy(mockService, { currentUserId: '1' }).subscribe(result => {
        expect(mockService.getAll).toHaveBeenCalled();
        expect(result).toEqual([expectedAssessment]);
        done();
      });
    });
  });

  describe(`${ERASRoles.PROFESSIONAL}`, () => {
    it('should call getByProfessional with provided user ID', done => {
      mockService.getByProfessional.and.returnValue(of([expectedAssessment]));

      const strategy = AssessmentFetchStrategies[ERASRoles.PROFESSIONAL];

      strategy(mockService, { currentUserId: 'uuid-1' }).subscribe(result => {
        expect(mockService.getByProfessional).toHaveBeenCalled();
        expect(result).toEqual([expectedAssessment]);
        done();
      });
    });

    it('should throw error if context not provided', done => {
      const strategy = AssessmentFetchStrategies[ERASRoles.PROFESSIONAL];

      strategy(mockService).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });

    it('should throw error if currentUserId not provided', done => {
      const strategy = AssessmentFetchStrategies[ERASRoles.PROFESSIONAL];

      strategy(mockService, { currentUserId: '' }).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });
  });
  describe(`${ERASRoles.OFFICER}`, () => {
    it('should call getByCreator with provided user ID', done => {
      mockService.getByCreator.and.returnValue(of([expectedAssessment]));

      const strategy = AssessmentFetchStrategies[ERASRoles.OFFICER];

      strategy(mockService, { currentUserId: 'uuid-1' }).subscribe(result => {
        expect(mockService.getByCreator).toHaveBeenCalled();
        expect(result).toEqual([expectedAssessment]);
        done();
      });
    });

    it('should throw error if context not provided', done => {
      const strategy = AssessmentFetchStrategies[ERASRoles.OFFICER];

      strategy(mockService).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });

    it('should throw error if currentUserId not provided', done => {
      const strategy = AssessmentFetchStrategies[ERASRoles.OFFICER];

      strategy(mockService, { currentUserId: '' }).subscribe({
        error: err => {
          expect(err.message).toBe('User ID not provided.');
          done();
        },
      });
    });
  });

  describe(`${ERASRoles.GUEST}`, () => {
    it('should throw error for non-authorized user', done => {
      const strategy = AssessmentFetchStrategies[ERASRoles.GUEST];

      strategy(mockService).subscribe({
        error: err => {
          expect(err.message).toBe('User not authorized.');
          done();
        },
      });
    });
  });
});
