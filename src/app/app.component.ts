import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserDataService } from '@core/services/access/user-data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'ERAS';
  private readonly userData = inject(UserDataService);

  async ngOnInit() {
    await this.userData.initUser();
  }
}
