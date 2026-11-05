import { Component, inject, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { LAYOUT_MESSAGES } from '@core/constants/messages';
import { ViewportService } from '@core/services/layout/viewport.service';
import { UserMenuComponent } from '../../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  imports: [UserMenuComponent, MatToolbar, MatIconButton, MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly menuToggle = output<void>();
  readonly messages = LAYOUT_MESSAGES;
  readonly isMobile = inject(ViewportService).isMobile;
}
