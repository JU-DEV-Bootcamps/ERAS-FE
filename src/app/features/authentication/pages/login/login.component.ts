import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { GoogleAuthComponent } from '../../../../shared/components/google-auth/google-auth.component';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatIconModule, MatCardModule, GoogleAuthComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {}
