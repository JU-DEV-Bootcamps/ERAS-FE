import { Component, inject, Input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
import { UserDataService } from '@core/services/access/user-data.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-header-v2',
  imports: [MatToolbar, UserMenuComponent, MatIcon],
  templateUrl: './header-v2.component.html',
  styleUrl: './header-v2.component.scss',
})
export class HeaderV2Component {
  @Input() sectionTitle!: string | null | undefined;
  private readonly userData = inject(UserDataService);
  user = this.userData.user;
}
