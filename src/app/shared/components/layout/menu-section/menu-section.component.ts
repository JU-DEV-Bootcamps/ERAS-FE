import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-menu-section',
  templateUrl: './menu-section.component.html',
  styleUrls: ['./menu-section.component.css'],
  imports: [MatIcon],
})
export class MenuSectionComponent {
  @Input() title!: string;
  @Input() icon?: string;
  @Input() isExpanded = false;

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
