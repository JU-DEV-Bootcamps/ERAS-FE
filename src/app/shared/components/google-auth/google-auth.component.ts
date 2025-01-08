import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GoogleSigninButtonModule,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-google-auth',
  imports: [CommonModule, GoogleSigninButtonModule],
  templateUrl: './google-auth.component.html',
  styleUrl: './google-auth.component.css',
})
export class GoogleAuthComponent implements OnInit {
  user?: SocialUser;
  loggedIn?: boolean;

  constructor(private googleAuthService: GoogleAuthService) {}

  ngOnInit(): void {
    this.googleAuthService.authState().subscribe(user => {
      this.user = user;
      this.loggedIn = user != null;
    });
  }

  logout() {
    this.googleAuthService.logout();
  }
}
