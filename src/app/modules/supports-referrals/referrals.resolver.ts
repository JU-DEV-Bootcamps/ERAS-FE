import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { Referral } from './referrals.interfaces';
import { ReferralsService } from './referrals.service';

export const referralsResolver: ResolveFn<Referral[]> = () => {
  const referralService = inject(ReferralsService);
  return referralService.getReferrals();
};
