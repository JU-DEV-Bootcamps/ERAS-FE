import { Component, Input, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  imports: [MatIcon],
})
export class MenuItemComponent {
  @Input() title!: string;
  @Input() icon?: string;
  @Input() redirectUrl!: string;

  private router = inject(Router);

  redirect() {
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
    }
  }
}
