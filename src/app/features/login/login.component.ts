import { Component, inject } from '@angular/core';
import { KeycloakAuthComponent } from '../../shared/components/keycloak-auth/keycloak-auth.component';
import { KeycloakService } from '../../core/services/keycloak.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [KeycloakAuthComponent, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  keycloakService = inject(KeycloakService);
}
