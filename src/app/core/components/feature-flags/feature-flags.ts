import { FeatureFlags } from '@core/components/feature-flags/feature-flags.model';

/**
 * Handles the new feature flags to avoid magic strings.
 *
 * Example:
 * currentSection: 'currentSectionV2'
 */
export const FEATURE_FLAGS: FeatureFlags = {
  dynamicCharts: 'dynamicChartsV2',
};
