import { Component, computed, inject, signal } from '@angular/core';
import { ERASRoles } from '@core/models/profile.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { ProfessionalInfoEditFormComponent } from './professional-info-edit-form/professional-info-edit-form.component';
import { ProfessionalInfoComponent } from './professional-info/professional-info.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { ProfileEditFormComponent } from './profile-edit-form/profile-edit-form.component';

@Component({
  selector: 'app-account-information',
  imports: [
    ProfileCardComponent,
    ProfileEditFormComponent,
    ProfessionalInfoComponent,
    ProfessionalInfoEditFormComponent,
  ],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss',
})
export class AccountInformationComponent {
  private readonly userData = inject(UserDataService);

  isEditing = signal(false);
  isEditingProfessional = signal(false);
  isProfessional = computed(
    () => this.userData.user()?.role === ERASRoles.PROFESSIONAL
  );

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
}
