import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfessionalProfile } from '@core/models/professional-profile.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalProfileService extends BaseApiService {
  protected resource = 'users';

  getMyProfessionalProfile(): Observable<ProfessionalProfile> {
    return this.get<ProfessionalProfile>('me/professional-profile');
  }

  updateMyProfessionalProfile(
    profile: ProfessionalProfile
  ): Observable<ProfessionalProfile> {
    return this.put<ProfessionalProfile, ProfessionalProfile>(
      'me/professional-profile',
      profile
    );
  }
}
