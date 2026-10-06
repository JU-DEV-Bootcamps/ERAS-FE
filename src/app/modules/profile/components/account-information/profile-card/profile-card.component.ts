import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserProfile } from '@core/models/user-profile.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { UserProfileService } from '@core/services/api/user-profile.service';

const AVATAR_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#84CC16',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
];

@Component({
  selector: 'app-profile-card',
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent implements OnInit {
  private readonly userProfileService = inject(UserProfileService);
  private readonly userData = inject(UserDataService);
  user = this.userData.user;

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
