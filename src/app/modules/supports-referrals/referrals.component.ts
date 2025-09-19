import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EventAction, EventLoad } from '@shared/events/load';
import { Pagination } from '@core/services/interfaces/server.type';
import { Referral, ResolverReferral } from './models/referrals.interfaces';

import { TYPE_ICON, TYPE_TITLE } from '@core/constants/messages';

import { ErasModalService } from '@shared/components/modals/eras-modal/eras-modal.service';
import { ReferralsService } from './services/referrals.service';

import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { ReferralFormComponent } from './components/referral-form/referral-form.component';
import { ReferralsGridComponent } from './components/referrals-grid/referrals-grid.component';
import { SuccessFailComponent } from '@shared/components/success-fail/success-fail.component';

@Component({
  selector: 'app-referrals',
  imports: [ErasButtonComponent, ReferralsGridComponent],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ReferralsComponent {
  //Services
  activatedRoute = inject(ActivatedRoute);
  erasModalService = inject(ErasModalService);
  referralService = inject(ReferralsService);
  router = inject(Router);

  //Signals
  pagination = signal<Pagination>({ page: 0, pageSize: 10 });
  referrals = signal<ResolverReferral>({ items: [], count: 0, profile: {} });
  lookups = computed(() => {
    return this.activatedRoute.snapshot.data['referrals'].lookups;
  });

  private lastPage = 0;
  private lastPageSize = 10;
  private refresh = false;

  constructor() {
    this.referrals.set(
      this.activatedRoute.snapshot.data['referrals'].referrals
    );

    effect(() => {
      const { page, pageSize } = this.pagination();

      if (!this.refresh && this._isLastPagination(page, pageSize)) return;

      this.refresh = false;
      this.lastPage = page;
      this.lastPageSize = pageSize;

      this.referralService
        .getReferralsPagination({ page, pageSize })
        .subscribe(referrals => this.referrals.set(referrals));
    });
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
    this.pagination.set({ page: event.page, pageSize: event.pageSize });
  }

  createReferral() {
    const erasModalData = {
      component: ReferralFormComponent,
      data: { ...this.lookups() },
      actions: [
        { label: 'Cancel', value: 'cancel' },
        { label: 'Create', value: 'save' },
      ],
      title: 'Create Referral',
    };

    this.erasModalService
      .openComponent(erasModalData)
      .afterClosed()
      .subscribe(action => {
        if (!action || action === 'cancel') return;
        this.referralService
          .postReferral(action.data)
          .subscribe(({ success }) => {
            if (success) {
              this._refreshReferrals();
              this._successMessage();
            }
          });
      });
  }

  private _isLastPagination(page: number, pageSize: number) {
    return this.lastPage === page && this.lastPageSize === pageSize;
  }

  private _refreshReferrals() {
    this.refresh = true;
    this.pagination.set({ page: this.lastPage, pageSize: this.lastPageSize });
  }

  private _successMessage() {
    const erasModalData = {
      component: SuccessFailComponent,
      data: {
        subtitle: TYPE_TITLE.success,
        type: TYPE_ICON.success,
      },
      actions: [{ label: 'Ok', value: 'cancel' }],
      title: '',
      closeButton: false,
    };

    this.erasModalService.openComponent(erasModalData);
  }
}
