import {
  GoogleLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  constructor(private authService: SocialAuthService) {}

  login() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  authState() {
    return this.authService.authState;
  }

  async logout() {
    await this.authService.signOut();
  }
}
