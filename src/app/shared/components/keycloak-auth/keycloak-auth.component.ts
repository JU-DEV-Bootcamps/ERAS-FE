import { SocialUser } from '@abacritt/angularx-social-login';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    console.info("ngOnInit KeycloakAuthComponent", this.keycloakService);
    if(this.keycloakService.isTokenValid){
        this.keycloakService.logToUserStore();
    }
  }
  async login(): Promise<void>{
    try {
        await this.keycloakService.init();
    } catch (error) {
        console.error("Error on keycloak init", error);
    }
    try {
        this.ngOnInit();
    } catch (error) {
        console.error("Something went wrong with ngOnInit for KeycloakAuthComponent", error);
    }
    this.router.navigate(['profile']);
  }
}
