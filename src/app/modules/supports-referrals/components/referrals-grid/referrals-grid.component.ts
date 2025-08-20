import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';

import {
  ActionDatas,
  ActionDataText,
} from '../../../../shared/components/list/types/action';
import { Column } from '../../../../shared/components/list/types/column';
import { Referral } from '../../models/referrals.interfaces';

import { TimestampToDatePipe } from '../../../../shared/pipes/timestamp-to-date.pipe';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { ErasButtonComponent } from '../../../../shared/components/buttons/eras-button/eras-button.component';

@Component({
  selector: 'referrals-grid',
  imports: [ListComponent, ErasButtonComponent],
  templateUrl: './referrals-grid.component.html',
  styleUrl: './referrals-grid.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReferralsGridComponent {
  referrals = input<Referral[]>([]);
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
      id: 'openStudentDetails',
      label: 'Actions',
      ngIconName: 'delete',
      tooltip: 'Delete referral',
      text: 'Delete',
    },
    {
      columnId: 'actions',
      id: 'goImport',
      label: 'Actions',
      ngIconName: 'edit',
      tooltip: 'Edit referral',
      text: 'Edit',
    },
    {
      columnId: 'actions',
      id: 'goImport',
      label: 'Actions',
      ngIconName: 'notes',
      tooltip: 'Open details',
      text: 'Detail',
    },
  ];
}
