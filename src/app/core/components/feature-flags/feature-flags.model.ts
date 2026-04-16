import { ErasRole } from '@core/models/profile.model';

export enum FeatureFlagsName {
  DYNAMIC_CHARTS_V2 = 'dynamicChartsV2',
  PLATFORM_SETTINGS = 'platformSettings',
  NEW_SIDEBAR = 'newSidebar',
}

export type FeatureFlags = Record<FeatureFlagsName, FeatureFlagRule>;
interface FeatureFlagRule {
  enabled: boolean;
  userRoles?: ErasRole[];
}
