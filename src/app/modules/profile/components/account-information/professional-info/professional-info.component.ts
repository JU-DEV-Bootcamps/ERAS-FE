import { Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProfessionalProfileStore } from '@core/store/professional-profile.store';

@Component({
  selector: 'app-professional-info',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './professional-info.component.html',
  styleUrl: './professional-info.component.scss',
})
export class ProfessionalInfoComponent {
  private readonly store = inject(ProfessionalProfileStore);
  profile = this.store.profile;

  edit = output<void>();
}
