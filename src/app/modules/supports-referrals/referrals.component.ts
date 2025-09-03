import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EventAction, EventLoad } from '@shared/events/load';
import { Referral } from './models/referrals.interfaces';

import { ReferralsService } from './services/referrals.service';

import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { ReferralsGridComponent } from './components/referrals-grid/referrals-grid.component';

@Component({
  selector: 'app-referrals',
  imports: [EmptyDataComponent, ErasButtonComponent, ReferralsGridComponent],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ReferralsComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  referralService = inject(ReferralsService);

  referrals = signal<Referral[]>([]);

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ referrals }) =>
      this.referrals.set(referrals)
    );
  }

  handleGridAction(event: EventAction) {
    const actions: Record<string, (referral: Referral) => void> = {
      openDetails: (referral: Referral) => {
        this.router.navigate(['/supports-referrals/details', referral.id]);
      },
    };

    if (actions[event.data.id]) {
      actions[event.data.id](event.item as Referral);
    }
  }

  handlePaginatorAction(event: EventLoad) {
    const pagination = {
      page: event.page,
      pageSize: event.pageSize,
    };

    this.referralService
      .getReferrals(pagination)
      .subscribe(data => this.referrals.set(data));
  }
}
