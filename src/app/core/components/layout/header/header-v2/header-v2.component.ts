import { Component, Input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { UserMenuComponent } from '../../user-menu/user-menu.component';

@Component({
  selector: 'app-header-v2',
  imports: [MatToolbar, UserMenuComponent],
  templateUrl: './header-v2.component.html',
  styleUrl: './header-v2.component.scss',
})
export class HeaderV2Component {
  @Input() sectionTitle!: string | null | undefined;
}
