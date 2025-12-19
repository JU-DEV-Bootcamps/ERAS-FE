import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { forkJoin, map, Observable } from 'rxjs';

import {
  ReferralStudent,
  ResolverReferralData,
} from '../models/referrals.interfaces';
import { mapFields } from '../utils/fieldMapper';

import { JuServicesService } from '../services/juServices.service';
import { ProfessionalsService } from '../services/professionals.service';
import { ReferralsService } from '../services/referrals.service';
import { StudentService } from '@core/services/api/student.service';
import { UserDataService } from '@core/services/access/user-data.service';

export const referralsResolver: ResolveFn<
  Observable<ResolverReferralData>
> = () => {
  const juServicesService = inject(JuServicesService);
  const userData = inject(UserDataService);
  const professionalsService = inject(ProfessionalsService);
  const referralService = inject(ReferralsService);
  const studentService = inject(StudentService);

  return forkJoin({
    professionals: professionalsService.getAllProfessionals(),
    referrals: referralService.getReferralsPagination({
      page: 0,
      pageSize: 10,
    }),
    services: juServicesService.getAllJuServices(),
    students: studentService.getAllStudents(),
  }).pipe(
    map(({ professionals, referrals, services, students }) => {
      return {
        referrals,
        lookups: {
          profiles: mapFields([userData.user()!], 'firstName', 'id'),
          services: mapFields(services.items, 'name', 'id'),
          professionals: mapFields(professionals.items, 'name', 'id'),
          students: mapFields(
            students.items as ReferralStudent[],
            'name',
            'id'
          ),
        },
      };
    })
  );
};
