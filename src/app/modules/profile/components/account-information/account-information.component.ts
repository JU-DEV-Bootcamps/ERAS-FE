import { Component, inject, OnInit, signal } from '@angular/core';
import { UserProfile } from '@core/models/user-profile.model';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { ProfileEditFormComponent } from './profile-edit-form/profile-edit-form.component';
import { ProfileSummaryComponent } from './profile-summary/profile-summary.component';

@Component({
  selector: 'app-account-information',
  imports: [
    ProfileCardComponent,
    ProfileEditFormComponent,
    ProfileSummaryComponent,
  ],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss',
})
export class AccountInformationComponent implements OnInit {
  private readonly userProfileService = inject(UserProfileService);

  isEditing = signal(false);
  summaryProfile = signal<UserProfile | null>(null);

  ngOnInit(): void {
    this.loadSummary();
  }

  startEdit(): void {
    this.isEditing.set(true);
  }

  stopEdit(): void {
    this.isEditing.set(false);
  }

  onSaved(): void {
    this.stopEdit();
    this.loadSummary();
  }

  private loadSummary(): void {
    this.userProfileService.getMyProfile().subscribe({
      next: profile => this.summaryProfile.set(profile),
      error: error =>
        console.error('Error while loading profile summary', error),
    });
  }
}
