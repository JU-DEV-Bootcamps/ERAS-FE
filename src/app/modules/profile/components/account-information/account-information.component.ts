import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ERASRoles } from '@core/models/profile.model';
import { UserProfile } from '@core/models/user-profile.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { ProfessionalInfoEditFormComponent } from './professional-info-edit-form/professional-info-edit-form.component';
import { ProfessionalInfoComponent } from './professional-info/professional-info.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { ProfileEditFormComponent } from './profile-edit-form/profile-edit-form.component';
import { ProfileSummaryComponent } from './profile-summary/profile-summary.component';

@Component({
  selector: 'app-account-information',
  imports: [
    ProfileCardComponent,
    ProfileEditFormComponent,
    ProfessionalInfoComponent,
    ProfessionalInfoEditFormComponent,
    ProfileSummaryComponent,
  ],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss',
})
export class AccountInformationComponent implements OnInit {
  private readonly userData = inject(UserDataService);
  private readonly userProfileService = inject(UserProfileService);

  isEditing = signal(false);
  isEditingProfessional = signal(false);
  summaryProfile = signal<UserProfile | null>(null);
  isProfessional = computed(
    () => this.userData.user()?.role === ERASRoles.PROFESSIONAL
  );

  ngOnInit(): void {
    this.loadSummary();
  }

  startEdit(): void {
    this.isEditing.set(true);
  }

  stopEdit(): void {
    this.isEditing.set(false);
  }

  startEditProfessional(): void {
    this.isEditingProfessional.set(true);
  }

  stopEditProfessional(): void {
    this.isEditingProfessional.set(false);
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
