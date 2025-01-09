import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GoogleSigninButtonModule,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

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

  constructor(private googleAuthService: GoogleAuthService) {}

  ngOnInit(): void {
    this.googleAuthService.authState().subscribe(user => {
      // User authenticated
      this.user = user;
      this.loggedIn = user != null;
      if (
        this.loggedIn &&
        typeof window !== 'undefined' &&
        window.localStorage
      ) {
        localStorage.setItem('user', JSON.stringify(this.user));
        this.router.navigate(['profile']);
      }
    });
  }

  logout() {
    this.googleAuthService.logout();
  }
}
