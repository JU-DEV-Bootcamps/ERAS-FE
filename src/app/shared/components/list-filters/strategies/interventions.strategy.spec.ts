import { TestBed } from '@angular/core/testing';

import { InterventionFilterStrategy } from './interventions.strategy';
import {
  InterventionModel,
  InterventionMode,
  InterventionType,
  InterventionStatus,
  RiskLevels,
} from '@core/models/assessment.model';
import { AppliedFilter, FilterName } from '../models/list-filters.interface';

describe('InterventionFilterStrategy', () => {
  let strategy: InterventionFilterStrategy;

  const makeIntervention = (
    overrides: Partial<InterventionModel> = {}
  ): InterventionModel => ({
    assessmentId: 1,
    kind: InterventionType.Individual,
    mode: InterventionMode.InPlace,
    status: InterventionStatus.Remitted,
    dateUtc: '2026-01-01T00:00:00Z',
    studentIds: [],
    riskLevelName: RiskLevels.High,
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    strategy = TestBed.inject(InterventionFilterStrategy);
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should return items matching status, type, and risk filters simultaneously', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
      makeIntervention({
        status: InterventionStatus.Finalized,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result.length).toBe(1);
    expect(result[0].status).toBe(InterventionStatus.Remitted);
  });

  it('should exclude an item when its status is not in the status filter values', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Finalized,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result).toEqual([]);
  });

  it('should exclude an item when its kind is not in the type filter values', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Group,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result).toEqual([]);
  });

  it('should exclude an item when its riskLevelName is not in the risk filter values', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.Low,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result).toEqual([]);
  });

  it('should exclude an item when intervention.status is falsy, even if the status filter would match', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: undefined,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result).toEqual([]);
  });

  it('should exclude every item when the status filter is not present at all', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result).toEqual([]);
  });

  it('should exclude every item when the type filter is not present at all', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result).toEqual([]);
  });

  it('should exclude every item when the risk filter is not present at all', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
    ];

    const result = strategy.apply(data, filters);

    expect(result).toEqual([]);
  });

  it('should return an empty array when filters is empty', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];

    const result = strategy.apply(data, []);

    expect(result).toEqual([]);
  });

  it('should return an empty array when data is empty', () => {
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply([], filters);

    expect(result).toEqual([]);
  });

  it('should match when the filter value array contains multiple accepted values', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Finalized,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      {
        name: FilterName.Status,
        value: [InterventionStatus.Remitted, InterventionStatus.Finalized],
      },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ];

    const result = strategy.apply(data, filters);

    expect(result.length).toBe(1);
  });

  it('should ignore filters whose name does not match Status, Type, or Risk', () => {
    const data: InterventionModel[] = [
      makeIntervention({
        status: InterventionStatus.Remitted,
        kind: InterventionType.Individual,
        riskLevelName: RiskLevels.High,
      }),
    ];
    const filters: AppliedFilter[] = [
      { name: FilterName.Status, value: [InterventionStatus.Remitted] },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
      { name: 'unrelatedFilter' as FilterName, value: ['whatever'] },
    ];

    const result = strategy.apply(data, filters);

    expect(result.length).toBe(1);
  });
});
