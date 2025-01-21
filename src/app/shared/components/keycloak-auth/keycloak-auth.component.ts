import { SocialUser } from '@abacritt/angularx-social-login';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../../store/user.store';
import { KeycloakService } from '../../../core/services/keycloak.service';

@Component({
  selector: 'app-keycloak-auth',
  imports: [],
  templateUrl: './keycloak-auth.component.html',
  styleUrl: './keycloak-auth.component.css'
})
export class KeycloakAuthComponent implements OnInit{
  user?: SocialUser;
  loggedIn?: boolean;
  router = inject(Router);
  userStore = inject(UserStore);

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
      this.keycloakService.init();
      this.router.navigate(['profile']);
  }
  login(): () => Promise<void>{
    const initFn = (() => {
        return () => this.keycloakService.init()
    });
    this.router.navigate(['profile']);
    return initFn();
  }
}
