import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { startWith, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { EventAction, EventLoad } from '@shared/events/load';
import { Pagination } from '@core/services/interfaces/server.type';
import { Referral } from './models/referrals.interfaces';

import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { ReferralsGridComponent } from './components/referrals-grid/referrals-grid.component';
import { ReferralsService } from './services/referrals.service';

@Component({
  selector: 'app-referrals',
  imports: [EmptyDataComponent, ErasButtonComponent, ReferralsGridComponent],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ReferralsComponent {
  activatedRoute = inject(ActivatedRoute);
  referralService = inject(ReferralsService);
  router = inject(Router);

  private _initialData = this.activatedRoute.snapshot.data['referrals'];

  pagination = signal<Pagination>({ page: 0, pageSize: 10 });

  referrals = toSignal(
    toObservable(this.pagination).pipe(
      startWith(this.pagination()),
      switchMap(pagination =>
        this.referralService.getReferralsPagination(pagination)
      )
    ),
    { initialValue: this._initialData }
  );

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
    this.pagination.set({ page: event.page, pageSize: event.pageSize });
  }
}
