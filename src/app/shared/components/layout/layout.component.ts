import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { UserStore } from '../../store/user.store';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  userStore = inject(UserStore);
  user?: { name: string; email: string; photoUrl: string };

  ngOnInit(): void {
    const user = this.userStore.user();
    if (user) {
      this.user = user;
    }
  }

  router = inject(Router);
  logout() {
    this.router.navigate(['login']);
    this.userStore.logout();
  }
  redirectSettings() {
    this.router.navigate(['cosmic-latte']);
  }
  redirectProfile() {
    this.router.navigate(['profile']);
  }
  redirectReports() {
    this.router.navigate(['heat-map']);
  }
  redirectImports() {
    this.router.navigate(['import-students']);
  }
}
