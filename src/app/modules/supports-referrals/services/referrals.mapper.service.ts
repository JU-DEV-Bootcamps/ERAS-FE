import { inject, Injectable } from '@angular/core';

import { forkJoin, map, of } from 'rxjs';
import Keycloak from 'keycloak-js';

import { Profile } from '@core/models/profile.model';
import { StudentResponse } from '@core/models/student-request.model';
import { StudentService } from '@core/services/api/student.service';
import { PagedResult } from '@core/services/interfaces/page.type';
import { RESTReferral } from '../models/referrals.interfaces';

enum StatusCode {
  'created',
  'submitted',
  'on-hold',
  'in-progress',
  'completed',
}

@Injectable({
  providedIn: 'root',
})
export class ReferralsMapperService {
  keycloak = inject(Keycloak);
  studentService = inject(StudentService);

  mapReferrals(referrals: PagedResult<RESTReferral>, profile: Profile) {
    if (!referrals.items.length) {
      return of({
        count: 0,
        items: [],
        profile: {},
      });
    }
    const referralRequests = referrals.items.map((referral: RESTReferral) => {
      const studentRequests = referral.studentIds.map((studentId: number) =>
        this.studentService.getStudentDetailsById(studentId, {
          page: 0,
          pageSize: 10,
        })
      );

      return forkJoin(studentRequests).pipe(
        map(students => ({
          ...referral,
          service: referral.juService.name,
          professional: referral.assignedProfessional.name,
          status: StatusCode[referral.status],
          submitter: profile.firstName,
          student: this.getStudents(students),
        }))
      );
    });

    return forkJoin(referralRequests).pipe(
      map(referralsPopulated => ({
        count: referrals.count,
        items: referralsPopulated,
        profile,
      }))
    );
  }

  getStudents(students: StudentResponse[]): string {
    return students
      .map((student: StudentResponse) => student.entity.name)
      .join(', ');
  }
}
