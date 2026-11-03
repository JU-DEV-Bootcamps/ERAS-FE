import { Component, inject, input, OnInit, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProfessionalProfileService } from '@core/services/api/professional-profile.service';
import { ProfessionalProfileStore } from '@core/store/professional-profile.store';

@Component({
  selector: 'app-professional-info',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './professional-info.component.html',
  styleUrl: './professional-info.component.scss',
})
export class ProfessionalInfoComponent implements OnInit {
  private readonly store = inject(ProfessionalProfileStore);
  private readonly professionalProfileService = inject(
    ProfessionalProfileService
  );

  profile = this.store.profile;

  // Read-only: the count comes from the general profile and is never edited here.
  activeInterventions = input<number>(0);

  edit = output<void>();

  ngOnInit(): void {
    this.professionalProfileService.getMyProfessionalProfile().subscribe({
      next: profile => this.store.setProfessionalProfile(profile),
      error: error =>
        console.error('Error while loading professional profile', error),
    });
  }
}
