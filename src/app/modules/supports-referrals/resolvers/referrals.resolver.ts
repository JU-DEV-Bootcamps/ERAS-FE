import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { Referral } from '../models/referrals.interfaces';
import { ReferralsService } from '../services/referrals.service';

export const referralsResolver: ResolveFn<Referral[]> = () => {
  const referralService = inject(ReferralsService);
  return referralService.getReferrals();
};
