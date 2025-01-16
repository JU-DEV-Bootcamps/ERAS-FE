import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAuthComponent } from '../../shared/components/google-auth/google-auth.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  imports: [GoogleAuthComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('user');
      if (user) {
        this.router.navigate(['/profile']);
      }
    }
  }
}
