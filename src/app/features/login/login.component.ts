import { Component, inject } from '@angular/core';
import { KeycloakAuthComponent } from '../../shared/components/keycloak-auth/keycloak-auth.component';
import { KeycloakService } from '../../core/services/keycloak.service';

@Component({
  selector: 'app-login',
  imports: [KeycloakAuthComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  keycloakService = inject(KeycloakService);
}
