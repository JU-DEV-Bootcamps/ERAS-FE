import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { forkJoin, map, Observable } from 'rxjs';
import Keycloak from 'keycloak-js';

import {
  ReferralStudent,
  ResolverReferralData,
} from '../models/referrals.interfaces';

import { JuServicesService } from '../services/juServices.service';
import { ProfessionalsService } from '../services/professionals.service';
import { ReferralsService } from '../services/referrals.service';
import { StudentService } from '@core/services/api/student.service';

export const referralsResolver: ResolveFn<
  Observable<ResolverReferralData>
> = () => {
  const juServicesService = inject(JuServicesService);
  const keycloak = inject(Keycloak);
  const professionalsService = inject(ProfessionalsService);
  const referralService = inject(ReferralsService);
  const studentService = inject(StudentService);

  return forkJoin({
    professionals: professionalsService.getAllProfessionals(),
    profiles: keycloak.loadUserProfile(),
    referrals: referralService.getReferralsPagination({
      page: 0,
      pageSize: 10,
    }),
    services: juServicesService.getAllJuServices(),
    students: studentService.getAllStudents(),
  }).pipe(
    map(({ professionals, profiles, referrals, services, students }) => {
      return {
        referrals,
        lookups: {
          profiles: [profiles],
          services: services.items,
          professionals: professionals.items,
          students: students.items as ReferralStudent[],
        },
      };
    })
  );
};
