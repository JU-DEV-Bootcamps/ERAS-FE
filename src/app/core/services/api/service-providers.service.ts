import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ServiceProviderModel } from '../../models/service-providers.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceProvidersService extends BaseApiService {
  protected resource = 'service-providers';
  serviceProvidersCache$: Observable<ServiceProviderModel[]> | null = null;

  getAllServiceProviders() {
    if (this.serviceProvidersCache$) return this.serviceProvidersCache$;
    return (this.serviceProvidersCache$ = this.get<ServiceProviderModel[]>(''));
  }
}
