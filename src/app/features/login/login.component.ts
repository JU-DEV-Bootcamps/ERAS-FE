import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAuthComponent } from '../../shared/components/google-auth/google-auth.component';
import { KeycloakAuthComponent } from '../../shared/components/keycloak-auth/keycloak-auth.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserStore } from '../../shared/store/user.store';

@Component({
  selector: 'app-login',
  imports: [
    GoogleAuthComponent,
    KeycloakAuthComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  userStore = inject(UserStore);
  constructor(private router: Router) {}
}
