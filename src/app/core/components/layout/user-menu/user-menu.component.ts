import {
  Component,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

import { UserDataService } from '@core/services/access/user-data.service';
import { AuthService } from '@core/services/access/access.service';
import { Router } from '@angular/router';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FeatureFlagsName } from '@core/components/feature-flags/feature-flags.model';

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
  private readonly featureFlagsService = inject(FeatureFlagsService);

  user = this.userData.user;
  canViewFeature: WritableSignal<boolean> = signal(false);

  constructor() {
    effect(() => {
      if (this.user()) {
        this.canViewFeature.set(
          this.featureFlagsService.isEnabled(FeatureFlagsName.PLATFORM_SETTINGS)
        );
      }
    });
  }

  logout() {
    this.userData.clear();
    this.authService.logout();
  }

  redirectToSettings() {
    this.router.navigate(['cosmic-latte']);
  }
}
