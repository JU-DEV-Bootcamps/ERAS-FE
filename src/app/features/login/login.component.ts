import { Component, inject } from '@angular/core';
import { KeycloakAuthComponent } from '../../shared/components/keycloak-auth/keycloak-auth.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { KeycloakService } from '../../core/services/keycloak.service';

@Component({
  selector: 'app-login',
  imports: [
    KeycloakAuthComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  keycloakService = inject(KeycloakService);
}
