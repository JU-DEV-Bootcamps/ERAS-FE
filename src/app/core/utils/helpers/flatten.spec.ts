import { flattenObj, flattenArray } from './flatten';

describe('Flatten Utils', () => {
  describe('flattenObj', () => {
    it('should return an empty object when input is empty', () => {
      expect(flattenObj({})).toEqual({});
    });

    it('should return an unchanged object if it is already flat', () => {
      const input = { a: 1, b: 'text', c: true };
      expect(flattenObj(input)).toEqual({ a: 1, b: 'text', c: true });
    });

    it('should flatten nested objects using the default separator', () => {
      const input = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            zip: 10001,
          },
        },
        active: true,
      };

      const expected = {
        'user.name': 'John',
        'user.address.city': 'New York',
        'user.address.zip': 10001,
        active: true,
      };

      expect(flattenObj(input)).toEqual(expected);
    });

    it('should flatten nested objects using a custom separator', () => {
      const input = {
        user: {
          profile: {
            age: 30,
          },
        },
      };

      const expected = {
        user_profile_age: 30,
      };

      expect(flattenObj(input, '', '_')).toEqual(expected);
    });

    it('should not flatten array values', () => {
      const input = {
        tags: ['admin', 'editor'],
        user: {
          roles: [1, 2],
        },
      };

      const expected = {
        tags: ['admin', 'editor'],
        'user.roles': [1, 2],
      };

      expect(flattenObj(input)).toEqual(expected);
    });

    it('should preserve null and undefined values', () => {
      const input = {
        a: null,
        b: undefined,
        c: {
          d: null,
        },
      };

      const expected = {
        a: null,
        b: undefined,
        'c.d': null,
      };

      expect(flattenObj(input)).toEqual(expected);
    });

    it('should ignore inherited prototype properties', () => {
      const proto = { inherited: 'skip' };
      const input = Object.create(proto);
      input.own = 'keep';

      expect(flattenObj(input)).toEqual({ own: 'keep' });
    });
  });

  describe('flattenArray', () => {
    it('should return an empty array if input is empty', () => {
      expect(flattenArray([])).toEqual([]);
    });

    it('should flatten each object within the array', () => {
      const input = [
        { id: 1, details: { name: 'Item 1' } },
        { id: 2, details: { name: 'Item 2' } },
      ];

      const expected = [
        { id: 1, 'details.name': 'Item 1' },
        { id: 2, 'details.name': 'Item 2' },
      ];

      expect(flattenArray(input)).toEqual(expected);
    });

    it('should pass custom separator to all objects in the array', () => {
      const input = [{ a: { b: 10 } }, { c: { d: 20 } }];

      const expected = [{ 'a/b': 10 }, { 'c/d': 20 }];

      expect(flattenArray(input, '/')).toEqual(expected);
    });
  });
});
