import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { ConfigurationsModel } from '../../models/configurations.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService extends BaseApiService {
  protected resource = 'configurations';
  configurationsCache$: Observable<ConfigurationsModel[]> | null = null;

  getAllConfigurations() {
    if (this.configurationsCache$) return this.configurationsCache$;
    return (this.configurationsCache$ = this.get<ConfigurationsModel[]>(''));
  }

  getConfigurationsByUserId(userId: string) {
    return this.get<ConfigurationsModel[]>(`${userId}`);
  }

  createConfiguration(configuration: ConfigurationsModel) {
    return this.post<ConfigurationsModel>('', configuration);
  }

  updateConfiguration(configuration: ConfigurationsModel) {
    return this.put<ConfigurationsModel>('', configuration);
  }

  deleteConfiguration(configurationId: number) {
    return this.delete(`${configurationId}`);
  }
}
