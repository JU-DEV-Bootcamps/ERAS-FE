import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserProfile } from '@core/models/user-profile.model';
import { UserProfileService } from '@core/services/api/user-profile.service';

@Component({
  selector: 'app-profile-card',
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent implements OnInit {
  private readonly userProfileService = inject(UserProfileService);

  profile: UserProfile | null = null;
  isLoading = false;
  hasError = false;

  ngOnInit(): void {
    this.loadProfile();
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
