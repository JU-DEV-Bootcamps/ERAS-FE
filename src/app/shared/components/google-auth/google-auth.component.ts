import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GoogleSigninButtonModule,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { UserStore } from '../../store/user.store';

@Component({
  selector: 'app-google-auth',
  imports: [CommonModule, GoogleSigninButtonModule, MatButtonModule],
  templateUrl: './google-auth.component.html',
  styleUrl: './google-auth.component.css',
})
export class GoogleAuthComponent implements OnInit {
  user?: SocialUser;
  loggedIn?: boolean;
  router = inject(Router);
  userStore = inject(UserStore);

  constructor(private googleAuthService: GoogleAuthService) {}

  ngOnInit(): void {
    this.googleAuthService.authState().subscribe(user => {
      this.user = user;
      this.loggedIn = user != null;
      if (this.loggedIn) {
        this.userStore.login({
          id: this.user.id,
          email: this.user.email,
          name: this.user.name,
          photoUrl: this.user.photoUrl,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          authToken: this.user.authToken,
          idToken: this.user.idToken,
          authorizationCode: this.user.authorizationCode,
        });
        this.router.navigate(['profile']);
      }
    });
  }
}
