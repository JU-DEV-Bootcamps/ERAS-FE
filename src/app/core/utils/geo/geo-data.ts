import { allCountries } from 'country-region-data';
import { Lookup } from '@core/models/lookup';

/**
 * Countries and their states/provinces (ISO 3166-1 / 3166-2), so addresses are
 * always typed the same way. The stored value is the English name.
 */
const byLabel = (a: Lookup, b: Lookup): number =>
  a.label.localeCompare(b.label, 'en');

export const COUNTRY_OPTIONS: Lookup[] = allCountries
  .map(([name]) => ({ label: name, value: name }))
  .sort(byLabel);

const REGIONS_BY_COUNTRY = new Map<string, Lookup[]>(
  allCountries.map(([name, , regions]) => [
    name,
    regions.map(([regionName]) => ({ label: regionName, value: regionName })),
  ])
);

/** States/provinces of a country; empty when unknown or the country has none. */
export function getRegionOptions(country?: string | null): Lookup[] {
  return REGIONS_BY_COUNTRY.get(country ?? '') ?? [];
}

/**
 * Keeps a value that is not in the list (e.g. data typed by hand before the
 * dropdowns existed) visible and selectable instead of silently dropping it.
 */
export function withCurrentValue(
  options: Lookup[],
  current?: string | null
): Lookup[] {
  if (!current || options.some(option => option.value === current)) {
    return options;
  }
  return [...options, { label: current, value: current }];
}
