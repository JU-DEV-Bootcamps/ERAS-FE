import { formatDate } from '@angular/common';
import {
  InterventionMode,
  InterventionStatus,
  InterventionType,
  RiskLevels,
} from '@core/models/assessment.model';
import type { InterventionRowViewModel } from '../components/interventions/interventions-list/intervention-list.component';
import {
  ACTIVITY_OPTIONS,
  AREA_OPTIONS,
  getOptionLabel,
} from '../components/interventions/interventions.constants';
import {
  INTERVENTION_EXPORT_COLUMNS,
  InterventionExportColumn,
} from '../models/intervention-export.columns';

const EMPTY = '—';

/** Labels as the pill badge of the table shows them. */
const BADGE_LABELS: Record<string, string> = {
  [InterventionType.Individual]: 'Individual',
  [InterventionType.Group]: 'Group',
  [InterventionMode.InPlace]: 'In-Place',
  [InterventionMode.Remote]: 'Remote',
  [InterventionStatus.Remitted]: 'Remitted',
  [InterventionStatus.InProgress]: 'In Progress',
  [InterventionStatus.Finalized]: 'Finalized',
  [RiskLevels.None]: EMPTY,
  [RiskLevels.Low]: 'Low',
  [RiskLevels.Medium]: 'Medium',
  [RiskLevels.High]: 'High',
};

const badge = (value?: string | null): string =>
  value ? (BADGE_LABELS[value] ?? value) : EMPTY;

const studentNames = (row: InterventionRowViewModel): string => {
  if (!Array.isArray(row.studentDisplay)) return EMPTY;
  const names = row.studentDisplay
    .map(student => student?.name)
    .filter((name): name is string => !!name);
  return names.length ? names.join(', ') : EMPTY;
};

const mapRow = (row: InterventionRowViewModel): string[] => {
  const values: Record<InterventionExportColumn['key'], string> = {
    date: formatDate(row.dateUtc, 'MM/dd/yyyy', 'en-US'),
    type: badge(row.kind),
    mode: badge(row.mode),
    activity: getOptionLabel(ACTIVITY_OPTIONS, row.activity) || EMPTY,
    professional: row.professional || EMPTY,
    student: studentNames(row),
    area: getOptionLabel(AREA_OPTIONS, row.area) || EMPTY,
    risk: badge(row.riskLevelName),
    endRisk: badge(row.endRiskLevelName ?? RiskLevels.None),
    status: badge(row.status),
    comment: row.comments?.trim() ? row.comments : EMPTY,
  };
  return INTERVENTION_EXPORT_COLUMNS.map(column => values[column.key]);
};

/** Plain strings in column order, in the same order as the given rows. */
export const buildInterventionExportRows = (
  rows: InterventionRowViewModel[]
): string[][] => rows.map(mapRow);
