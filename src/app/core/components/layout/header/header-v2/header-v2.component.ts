import { Component, inject, Input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
import { UserDataService } from '@core/services/access/user-data.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { LAYOUT_MESSAGES } from '@core/constants/messages';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-header-v2',
  imports: [MatToolbar, UserMenuComponent, MatIcon, MatIconButton],
  templateUrl: './header-v2.component.html',
  styleUrl: './header-v2.component.scss',
})
export class HeaderV2Component {
  @Input() sectionTitle!: string | null | undefined;
  readonly menuToggle = output<void>();
  readonly messages = LAYOUT_MESSAGES;
  private readonly userData = inject(UserDataService);
  readonly isMobile = inject(ViewportService).isMobile;
  user = this.userData.user;
}
