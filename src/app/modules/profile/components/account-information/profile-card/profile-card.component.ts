import { Component, inject, OnInit, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AVATAR_COLORS } from '@core/constants/avatarColors';
import { UserProfile } from '@core/models/user-profile.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { UserProfileService } from '@core/services/api/user-profile.service';

@Component({
  selector: 'app-profile-card',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent implements OnInit {
  private readonly userProfileService = inject(UserProfileService);
  private readonly userData = inject(UserDataService);
  user = this.userData.user;

  edit = output<void>();

  profile: UserProfile | null = null;
  isLoading = false;
  hasError = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  get initials(): string {
    if (!this.profile) return '';
    return `${this.profile.firstName?.charAt(0) ?? ''}${this.profile.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }

  get avatarColor(): string {
    if (!this.profile) return AVATAR_COLORS[0];
    const name = `${this.profile.firstName}${this.profile.lastName}`;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  loadProfile(): void {
    this.isLoading = true;
    this.hasError = false;

    this.userProfileService.getMyProfile().subscribe({
      next: profile => {
        this.profile = profile;
      },
      error: error => {
        this.hasError = true;
        this.isLoading = false;
        console.error('Error while fetching user profile', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
