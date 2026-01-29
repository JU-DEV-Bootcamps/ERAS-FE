import { Component, inject } from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';

import { UserDataService } from '@core/services/access/user-data.service';
import { AuthService } from '@core/services/access/access.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  imports: [MatMenu, MatIcon, MatToolbar, MatMenuTrigger],
})
export class UserMenuComponent {
  timedOutCloser: ReturnType<typeof setTimeout> | null = null;
  private readonly authService = inject(AuthService);
  private readonly userData = inject(UserDataService);

  logout() {
    this.userData.clear();
    this.authService.logout();
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
