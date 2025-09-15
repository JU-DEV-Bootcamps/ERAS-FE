import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ReferralsService } from '../services/referrals.service';
import { Observable } from 'rxjs';
import { Referral } from '../models/referrals.interfaces';
import { Profile } from '@core/models/profile.model';

export const referralsResolver: ResolveFn<
  Observable<{ count: number; items: Referral[]; profile: Profile }>
> = () => {
  const referralService = inject(ReferralsService);
  return referralService.getReferralsPagination({ page: 0, pageSize: 10 });
};
