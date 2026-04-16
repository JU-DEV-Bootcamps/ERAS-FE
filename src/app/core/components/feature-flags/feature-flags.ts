import { FeatureFlags } from './feature-flags.model';

export const FEATURE_FLAGS: FeatureFlags = {
  dynamicChartsV2: { enabled: true },
  platformSettings: { enabled: true, userRoles: ['Eras Admin'] },
  newSidebar: { enabled: true },
};
