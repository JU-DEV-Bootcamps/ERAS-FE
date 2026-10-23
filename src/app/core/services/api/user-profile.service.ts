import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import {
  UpdateUserProfileRequest,
  UserProfile,
} from '../../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService extends BaseApiService {
  protected resource = 'users';

  getMyProfile() {
    return this.get<UserProfile>('me/profile').pipe(
      catchError(() => {
        return throwError(() => new Error('Error fetching user profile'));
      })
    );
  }

  updateMyProfile(payload: UpdateUserProfileRequest) {
    return this.put<UpdateUserProfileRequest, UserProfile>(
      'me/profile',
      payload
    ).pipe(
      catchError(() => {
        return throwError(() => new Error('Error updating user profile'));
      })
    );
  }
}
