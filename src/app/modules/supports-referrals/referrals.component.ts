import { ActivatedRoute } from '@angular/router';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { Referral } from './referrals.interfaces';
import { EmptyDataComponent } from '../../shared/components/empty-data/empty-data.component';
import { ErasButtonComponent } from '../../shared/components/buttons/eras-button/eras-button.component';

@Component({
  selector: 'app-referrals',
  imports: [EmptyDataComponent, ErasButtonComponent],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ReferralsComponent implements OnInit {
  referrals = signal<Referral[]>([]);
  activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ referrals }) =>
      this.referrals.set(referrals)
    );
  }
}
