import { Component } from '@angular/core';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  imports: [UserMenuComponent, MatToolbar],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {}
