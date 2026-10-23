import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExportLoadingOverlayComponent } from '@shared/components/export-loading-overlay/export-loading-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ExportLoadingOverlayComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'ERAS';
}
