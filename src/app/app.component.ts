import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserDataService } from '@core/services/access/user-data.service';
import { ExportLoadingOverlayComponent } from '@shared/components/export-loading-overlay/export-loading-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ExportLoadingOverlayComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'ERAS';
  private readonly userData = inject(UserDataService);

  async ngOnInit() {
    await this.userData.initUser();
  }
}
