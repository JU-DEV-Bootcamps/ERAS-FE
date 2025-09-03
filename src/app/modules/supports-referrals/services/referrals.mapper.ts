import { Referral, RESTReferral } from '../models/referrals.interfaces';

enum StatusCode {
  'created',
  'submitted',
  'on-hold',
  'in-progress',
  'completed',
}

export class ReferralsMapper {
  static mapRestReferralToReferral(restReferral: RESTReferral): Referral {
    return {
      id: restReferral.id,
      date: restReferral.date.toString(),
      submitter: restReferral.submitterUuid,
      service: restReferral.juService.name,
      professional: '',
      student: restReferral.students[0].name,
      comment: restReferral.comment,
      status: StatusCode[restReferral.status],
    };
  }
}
