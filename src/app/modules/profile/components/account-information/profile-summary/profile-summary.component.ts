import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '@core/models/user-profile.model';

interface SummaryTile {
  key: string;
  label: string;
  value: string;
  icon: string;
  tone: 'blue' | 'green' | 'purple';
}

const EMPTY_VALUE = '—';

@Component({
  selector: 'app-profile-summary',
  imports: [MatIconModule],
  templateUrl: './profile-summary.component.html',
  styleUrl: './profile-summary.component.scss',
})
export class ProfileSummaryComponent {
  profile = input<UserProfile | null>(null);

  tiles = computed<SummaryTile[]>(() => {
    const profile = this.profile();
    if (!profile) return [];

    return [
      {
        key: 'position',
        label: 'Position',
        value: profile.position?.trim() || EMPTY_VALUE,
        icon: 'work',
        tone: 'blue',
      },
      {
        key: 'active-assessments',
        label: 'Active assessments',
        value: this.ongoing(profile.activeAssessmentsCount),
        icon: 'assignment_turned_in',
        tone: 'purple',
      },
      {
        key: 'active-interventions',
        label: 'Active interventions',
        value: this.ongoing(profile.activeInterventionsCount),
        icon: 'volunteer_activism',
        tone: 'green',
      },
    ];
  });

  private ongoing(count?: number): string {
    return `${count ?? 0} Ongoing`;
  }
}
