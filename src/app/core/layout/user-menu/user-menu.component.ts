import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  imports: [MatMenu, MatIcon, MatToolbar, MatMenuTrigger],
})
export class UserMenuComponent {
  user?: { name: string; email: string };
  timedOutCloser: ReturnType<typeof setTimeout> | null = null;
  private readonly keycloak = inject(Keycloak);

  constructor() {
    this.user = {
      name: this.keycloak.clientId || 'NameNot Found',
      email: 'userInfo.email',
    };
  }

  logout() {
    this.keycloak.logout();
  }

  mouseEnter(trigger: MatMenuTrigger) {
    if (this.timedOutCloser) {
      clearTimeout(this.timedOutCloser);
    }
    trigger.openMenu();
  }

  mouseLeave(trigger: MatMenuTrigger) {
    this.timedOutCloser = setTimeout(() => {
      trigger.closeMenu();
    }, 100);
  }
}
