import { ERASRoles } from '@core/models/profile.model';
import { ROUTE_METADATA } from './route-metadata';

describe('ROUTE_METADATA', () => {
  it('lets administrators, officers and professionals open the Students section', () => {
    expect(ROUTE_METADATA.STUDENTS.roles).toEqual([
      ERASRoles.ADMIN,
      ERASRoles.OFFICER,
      ERASRoles.PROFESSIONAL,
    ]);
  });
});
