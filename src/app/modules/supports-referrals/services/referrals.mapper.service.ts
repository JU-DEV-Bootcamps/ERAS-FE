import { inject, Injectable } from '@angular/core';

import { forkJoin, map, Observable, of } from 'rxjs';

import { Profile } from '@core/models/profile.model';
import { StudentResponse } from '@core/models/student-request.model';
import { StudentService } from '@core/services/api/student.service';
import { PagedResult } from '@core/services/interfaces/page.type';
import { Referral, RESTReferral } from '../models/referrals.interfaces';

enum StatusCode {
  'Created',
  'Submitted',
  'On Hold',
  'In Progress',
  'Completed',
}

@Injectable({
  providedIn: 'root',
})
export class ReferralsMapperService {
  studentService = inject(StudentService);

  mapReferrals(referrals: PagedResult<RESTReferral>, profile: Profile) {
    if (!referrals.items.length) {
      return of({
        count: 0,
        items: [],
        profile: {},
      });
    }
    const referralRequests = referrals.items.map((referral: RESTReferral) =>
      this._getStudents(referral, profile)
    );

    return forkJoin(referralRequests).pipe(
      map(referralsPopulated => ({
        count: referrals.count,
        items: referralsPopulated,
        profile,
      }))
    );
  }

  mapReferral(referral: RESTReferral, profile: Profile): Observable<Referral> {
    return this._getStudents(referral, profile);
  }

  _getStudents(referral: RESTReferral, profile: Profile): Observable<Referral> {
    const studentRequests = referral.studentIds.map((studentId: number) =>
      this.studentService.getStudentDetailsById(studentId, {
        page: 0,
        pageSize: 10,
      })
    );

    return forkJoin(studentRequests).pipe(
      map(students => ({
        comment: referral.comment,
        date: referral.date,
        id: referral.id,
        professional: referral.assignedProfessional.name,
        service: referral.juService.name,
        status: StatusCode[referral.status],
        student: this._getStudentsNames(students),
        submitter: profile.firstName,
      }))
    );
  }

  _getStudentsNames(students: StudentResponse[]): string {
    return students
      .map((student: StudentResponse) => student.entity.name)
      .join(', ');
  }
}
