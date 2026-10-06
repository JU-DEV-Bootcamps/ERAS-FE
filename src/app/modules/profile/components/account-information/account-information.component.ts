import { Component } from '@angular/core';
import { ProfileCardComponent } from './profile-card/profile-card.component';

@Component({
  selector: 'app-account-information',
  imports: [ProfileCardComponent],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss',
})
export class AccountInformationComponent {}
