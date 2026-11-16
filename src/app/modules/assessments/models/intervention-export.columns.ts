export interface InterventionExportColumn {
  key:
    | 'date'
    | 'type'
    | 'mode'
    | 'activity'
    | 'professional'
    | 'student'
    | 'area'
    | 'risk'
    | 'endRisk'
    | 'status'
    | 'comment';
  label: string;
}

/** Order and labels of the Interventions table, without the Actions column. */
export const INTERVENTION_EXPORT_COLUMNS: readonly InterventionExportColumn[] =
  [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'mode', label: 'Mode' },
    { key: 'activity', label: 'Activity' },
    { key: 'professional', label: 'Professional' },
    { key: 'student', label: 'Student' },
    { key: 'area', label: 'Area' },
    { key: 'risk', label: 'Risk Level' },
    { key: 'endRisk', label: 'End Risk Level' },
    { key: 'status', label: 'Status' },
    { key: 'comment', label: 'Comment' },
  ];
