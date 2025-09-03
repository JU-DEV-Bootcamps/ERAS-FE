import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  output,
} from '@angular/core';

import {
  ActionDatas,
  ActionDataText,
} from '@shared/components/list/types/action';
import { Column } from '@shared/components/list/types/column';
import { EventAction, EventLoad } from '@shared/events/load';
import { Referral } from '@modules/supports-referrals/models/referrals.interfaces';

import { TimestampToDatePipe } from '@shared/pipes/timestamp-to-date.pipe';

import { ListComponent } from '@shared/components/list/list.component';

@Component({
  selector: 'app-referrals-grid',
  imports: [ListComponent],
  templateUrl: './referrals-grid.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReferralsGridComponent {
  referrals = input<Referral[]>([]);
  gridAction = output<EventAction>();
  paginatorAction = output<EventLoad>();

  transformPipe = new TimestampToDatePipe();

  columns: Column<Referral>[] = [
    {
      key: 'date',
      label: 'Date',
      pipe: this.transformPipe,
      pipeKey: 'date',
    },
    {
      key: 'submitter',
      label: 'Submitter',
    },
    {
      key: 'service',
      label: 'Service',
    },
    {
      key: 'professional',
      label: 'Professional',
    },
    {
      key: 'student',
      label: 'Student',
    },
    {
      key: 'comment',
      label: 'Comment',
    },
    {
      key: 'status',
      label: 'Status',
    },
  ];

  actionDatas: ActionDatas<ActionDataText> = [
    {
      columnId: 'actions',
      id: 'deleteReferral',
      label: 'Actions',
      ngIconName: 'delete',
      tooltip: 'Delete referral',
      text: 'Delete',
    },
    {
      columnId: 'actions',
      id: 'editReferral',
      label: 'Actions',
      ngIconName: 'edit',
      tooltip: 'Edit referral',
      text: 'Edit',
    },
    {
      columnId: 'actions',
      id: 'openDetails',
      label: 'Actions',
      ngIconName: 'notes',
      tooltip: 'Open details',
      text: 'Details',
    },
  ];
}
