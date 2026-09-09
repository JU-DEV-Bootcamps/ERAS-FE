import { Component, inject, computed } from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserDataService } from '@core/services/access/user-data.service';
import { AuthService } from '@core/services/access/access.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { Router } from '@angular/router';
import { ERASRoles } from '@core/models/profile.model';
import { ViewPermissions } from '@core/models/role-permissions.model';
import { HasERASRolesDirective } from '@shared/directives/has-roles.directive';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  imports: [
    MatMenu,
    MatMenuModule,
    MatIcon,
    MatMenuTrigger,
    MatSlideToggleModule,
    MatTooltipModule,
    HasERASRolesDirective,
  ],
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly userData = inject(UserDataService);
  private readonly featureFlags = inject(FeatureFlagsService);
  private readonly router = inject(Router);

  user = this.userData.user;
  v2Enabled = computed(() => this.featureFlags.isEnabled(FEATURE_FLAGS.home));
  viewPermissions: ViewPermissions = {
    v2Button: [ERASRoles.ADMIN],
  };

  logout() {
    this.userData.clear();
    this.authService.logout();
  }

  redirectToSettings() {
    this.router.navigate(['cosmic-latte']);
  }

  onV2Toggle(event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    this.featureFlags.toggle('v2', enabled).subscribe();
  }
}
