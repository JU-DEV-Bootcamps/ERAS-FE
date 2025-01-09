import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GoogleSigninButtonModule,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-auth',
  imports: [CommonModule, GoogleSigninButtonModule],
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
      this.user = user;
      this.loggedIn = user != null;
      if (this.loggedIn) {
        localStorage.setItem('user', JSON.stringify(this.user));
        this.router.navigate(['profile']);
      }
    });
  }

  logout() {
    this.googleAuthService.logout();
  }
}
