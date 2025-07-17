import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';

import { MenuSectionComponent } from './menu-section/menu-section.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { UserMenuComponent } from './user-menu/user-menu.component';

enum Sidenav {
  shrink = '70px',
  expand = '250px',
}

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MenuSectionComponent,
    MenuItemComponent,
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    UserMenuComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  breakpointObserver = inject(BreakpointObserver);
  collapsed = signal(false);
  sidenavWidth = computed(() =>
    this.collapsed() ? Sidenav.shrink : Sidenav.expand
  );

  @ViewChild('sidenav', { read: ElementRef }) sidenavRef!: ElementRef;
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      !this.collapsed() &&
      this.sidenavRef &&
      !this.sidenavRef.nativeElement.contains(event.target)
    ) {
      this.collapsed.set(!this.collapsed());
    }
  }

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Small, '(max-width: 1200px)'])
      .subscribe((state: BreakpointState) => this.collapsed.set(state.matches));
  }
}
