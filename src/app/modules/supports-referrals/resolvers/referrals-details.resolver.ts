import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { Referral } from '../models/referrals.interfaces';
import { ReferralsService } from '../services/referrals.service';

export const referralDetailsResolver: ResolveFn<Referral> = (
  route: ActivatedRouteSnapshot
) => {
  const referralService = inject(ReferralsService);

  const id = route.paramMap.get('id');
  return referralService.getReferralById(Number(id));
};
