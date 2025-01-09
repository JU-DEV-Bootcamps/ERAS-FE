import { Component } from '@angular/core';
import { GoogleAuthComponent } from '../google-auth/google-auth.component';
import {
  MatCardContent,
  MatCardHeader,
  MatCardModule,
} from '@angular/material/card';

@Component({
  selector: 'app-login',
  imports: [GoogleAuthComponent, MatCardModule, MatCardHeader, MatCardContent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {}
