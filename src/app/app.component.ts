import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { UserDataService } from '@core/services/access/user-data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'ERAS';
  private readonly userData = inject(UserDataService);
  private readonly featureFlagService = inject(FeatureFlagsService);

  async ngOnInit() {
    await this.userData.initUser();
    this.featureFlagService.loadFeatureFlags();
  }
}
