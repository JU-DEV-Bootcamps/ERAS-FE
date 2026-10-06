import { Component, signal } from '@angular/core';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { ProfileEditFormComponent } from './profile-edit-form/profile-edit-form.component';

@Component({
  selector: 'app-account-information',
  imports: [ProfileCardComponent, ProfileEditFormComponent],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss',
})
export class AccountInformationComponent {
  isEditing = signal(false);

  startEdit(): void {
    this.isEditing.set(true);
  }

  stopEdit(): void {
    this.isEditing.set(false);
  }
}
