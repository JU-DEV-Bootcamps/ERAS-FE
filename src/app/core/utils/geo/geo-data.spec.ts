import {
  COUNTRY_OPTIONS,
  getRegionOptions,
  withCurrentValue,
} from './geo-data';

describe('geo-data', () => {
  describe('COUNTRY_OPTIONS', () => {
    it('should list the countries alphabetically using the name as value', () => {
      const labels = COUNTRY_OPTIONS.map(c => c.label);

      expect(COUNTRY_OPTIONS.length).toBeGreaterThan(200);
      expect(labels).toContain('Bolivia');
      expect(labels).toEqual(
        [...labels].sort((a, b) => a.localeCompare(b, 'en'))
      );
      COUNTRY_OPTIONS.forEach(c => expect(c.value).toBe(c.label));
    });
  });

  describe('getRegionOptions', () => {
    it('should return the states/provinces of a country', () => {
      const labels = getRegionOptions('Bolivia').map(r => r.label);

      expect(labels).toContain('La Paz');
      expect(labels).toContain('Cochabamba');
    });

    it('should return an empty list for an unknown or empty country', () => {
      expect(getRegionOptions('Atlantis')).toEqual([]);
      expect(getRegionOptions('')).toEqual([]);
      expect(getRegionOptions(null)).toEqual([]);
      expect(getRegionOptions(undefined)).toEqual([]);
    });
  });

  describe('withCurrentValue', () => {
    const options = [{ label: 'A', value: 'A' }];

    it('should leave the options untouched when the value is listed or empty', () => {
      expect(withCurrentValue(options, 'A')).toBe(options);
      expect(withCurrentValue(options, '')).toBe(options);
      expect(withCurrentValue(options, null)).toBe(options);
    });

    it('should append a value that is not in the list without mutating it', () => {
      const result = withCurrentValue(options, 'Murillo');

      expect(result).toEqual([
        { label: 'A', value: 'A' },
        { label: 'Murillo', value: 'Murillo' },
      ]);
      expect(options.length).toBe(1);
    });
  });
});
