import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { Referral } from '../models/referrals.interfaces';
import { ReferralsService } from '../services/referrals.service';
import { BreadcrumbsService } from '@core/services/breadcrumbs.service';

export const referralDetailsResolver: ResolveFn<Referral> = (
  route: ActivatedRouteSnapshot
) => {
  const breadcrumbService = inject(BreadcrumbsService);
  const referralService = inject(ReferralsService);

  breadcrumbService.initializer();

  const id = route.paramMap.get('id');
  return referralService.getReferralById(Number(id));
};
