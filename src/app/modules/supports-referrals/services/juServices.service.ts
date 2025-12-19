import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { JuService } from '../models/referrals.interfaces';
import { PagedResult } from '@core/services/interfaces/page.type';

import { BaseApiService } from '@core/services/api/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class JuServicesService extends BaseApiService {
  protected resource = 'ju_services';

  getAllJuServices(): Observable<PagedResult<JuService>> {
    return this.get<PagedResult<JuService>>('');
  }
}
