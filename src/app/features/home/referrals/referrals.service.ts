import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';
import { Referral } from './referrals.interfaces';
import { BaseApiService } from '../../../core/services/api/base-api.service';
import { PagedResult } from 'src/app/core/services/interfaces/page.type';
import { ApiResponse } from 'src/app/core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ReferralsService extends BaseApiService {
  protected resource = 'referrals';

  getReferrals() {
    // TODO: Remove fake response and return the right call to referrals API.
    return of<ApiResponse<PagedResult<Referral>>>({
      body: {
        count: 4,
        items: [
          {
            id: 1,
            date: '2025-07-17T16:01:06.351633Z',
            submitter: 'Pablo',
            service: 'Student Services',
            professional: 'Master',
            student: 'Jane doe',
            comment: 'a Comment',
            status: 'created',
          },
        ],
      },
      success: true,
      message: 'Success',
      validationErrors: [],
    }).pipe(
      map<ApiResponse<PagedResult<Referral>>, Referral[]>(
        response => response.body.items || []
      )
    );
  }
}
