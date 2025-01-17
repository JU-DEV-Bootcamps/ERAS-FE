import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { UserStore } from '../../shared/store/user.store';

@Component({
  selector: 'app-profile',
  imports: [MatCardModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user?: { name: string; email: string; photoUrl: string } = {
    name: '',
    email: '',
    photoUrl: '',
  };

  userStore = inject(UserStore);

  ngOnInit(): void {
    const user = this.userStore.user();
    if (user) {
      this.user = user;
    }
  }
}
