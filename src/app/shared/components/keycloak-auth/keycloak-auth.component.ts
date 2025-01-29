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
  loggedIn?: boolean;
  router = inject(Router);

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    console.info("ngOnInit KeycloakAuthComponent", this.keycloakService);
    if(this.keycloakService?.isTokenValid){
        this.router.navigate(['profile']);
    }
  }
  async login(): Promise<void>{
    try {
        await this.keycloakService.init();
    } catch (error) {
        console.error("Error on keycloak init", error);
    }
    this.router.navigate(['profile']);
  }
}
