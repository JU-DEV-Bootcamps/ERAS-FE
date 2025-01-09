import { Component, OnInit } from '@angular/core';
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

  constructor(
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.googleAuthService.authState().subscribe(user => {
      // User authenticated
      this.user = user;
      if (user != null) {
        const userCopy = {
          photoUrl: this.user.photoUrl,
          name: this.user.name,
          email: this.user.email,
        };
        localStorage.setItem('user', JSON.stringify(userCopy));
        this.router.navigate(['/home']);
      }
    });
  }
}
