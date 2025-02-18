import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, MatButton],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  keycloak = inject(Keycloak);
  click() {
    this.keycloak.login();
  }
}
