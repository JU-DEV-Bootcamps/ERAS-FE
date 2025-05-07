export type ComponentsAvgGroupedByCohortsModel = ComponentsAvgCohortModel[];

interface ComponentsAvgCohortModel {
  cohortId: number;
  cohortName: string;
  componentsAvg: Record<string, number>[];
}
