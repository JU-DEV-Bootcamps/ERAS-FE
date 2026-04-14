import { Component, inject } from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

import { UserDataService } from '@core/services/access/user-data.service';
import { AuthService } from '@core/services/access/access.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  imports: [MatMenu, MatIcon, MatMenuTrigger],
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly userData = inject(UserDataService);
  private readonly router = inject(Router);

  user = this.userData.user;
  // TODO: Add logic for userRole when roles are implemented
  userRole = 'User';

  logout() {
    this.userData.clear();
    this.authService.logout();
  }

  redirectToSettings() {
    this.router.navigate(['cosmic-latte']);
  }
}
