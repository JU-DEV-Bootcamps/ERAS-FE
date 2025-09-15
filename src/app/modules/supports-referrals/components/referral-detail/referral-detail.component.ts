import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatCard, MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDivider } from '@angular/material/divider';
import { MatIcon, MatIconModule } from '@angular/material/icon';

import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { Referral } from '@modules/supports-referrals/models/referrals.interfaces';

import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  imports: [
    CommonModule,
    MatCard,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDivider,
    MatIcon,
    BreadcrumbComponent,
    ErasButtonComponent,
  ],
  templateUrl: './referral-detail.component.html',
  styleUrl: './referral-detail.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ReferralDetailComponent {
  route = inject(ActivatedRoute);
  referral = toSignal<Referral>(
    this.route.data.pipe(map(data => data['referral'] as Referral)),
    { initialValue: null }
  );

  statusColor = computed(() => {
    return this.getStatusColor(this.referral()!.status);
  });

  getStatusColor(status: string): string {
    const statusColor: Record<string, string> = {
      Created: '128, 128, 0', //olive
      Submitted: '0,0,255', //blue
      'On Hold': '255,255,0', //yellow
      'In Progress': '255,165,0', //orange
      Completed: '0,128,0', //green
    };
    return statusColor[status];
  }
}
