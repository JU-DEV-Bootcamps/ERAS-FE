import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ViewportService } from '@core/services/layout/viewport.service';
import { ActionDatas } from './list/types/action';
import { Column } from './list/types/column';
import { TableWithActionsComponent } from './table-with-actions/table-with-actions.component';
import { TableWithRedirectComponent } from './table-with-redirect/table-with-redirect.component';

interface Row {
  name: string;
  status: string;
}

const MIN_TAP = 48;
const BUTTON_HEIGHT = 40;
const ACTIONS_ROW_HEIGHT = 48;
const REDIRECT_ROW_HEIGHT = 52;

describe('Shared tables touch targets', () => {
  let isMobile: WritableSignal<boolean>;

  const rows: Row[] = [
    { name: 'Ana', status: 'Active' },
    { name: 'Luis', status: 'Inactive' },
  ];
  const columns: Column<Row>[] = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];
  const actions: ActionDatas = [
    { columnId: 'actions', ngIconName: 'edit', label: 'Edit', id: 'edit' },
    {
      columnId: 'actions',
      ngIconName: 'delete',
      label: 'Delete',
      id: 'delete',
    },
  ];

  const touchTargetOf = (button: HTMLElement) =>
    button.querySelector<HTMLElement>('.mat-mdc-button-touch-target')!;

  const rect = (element: Element) => element.getBoundingClientRect();

  const tableWithActions = (
    mobile: boolean
  ): ComponentFixture<TableWithActionsComponent<Row>> => {
    isMobile.set(mobile);
    const fixture = TestBed.createComponent(TableWithActionsComponent<Row>);
    fixture.nativeElement.style.cssText = `display:block;width:${mobile ? 375 : 1280}px`;
    fixture.componentInstance.items = rows;
    fixture.componentInstance.columns = columns;
    fixture.componentRef.setInput('actionDatas', actions);
    fixture.detectChanges();
    return fixture;
  };

  const tableWithRedirect = (
    mobile: boolean
  ): ComponentFixture<TableWithRedirectComponent> => {
    isMobile.set(mobile);
    const fixture = TestBed.createComponent(TableWithRedirectComponent);
    fixture.nativeElement.style.cssText = `display:block;width:${mobile ? 375 : 1280}px`;
    fixture.componentInstance.columns = ['name', 'status'];
    fixture.componentInstance.dataSource = rows as unknown as Record<
      string,
      unknown
    >[];
    fixture.componentInstance.icon = 'visibility';
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(async () => {
    isMobile = signal(false);
    await TestBed.configureTestingModule({
      imports: [TableWithActionsComponent, TableWithRedirectComponent],
      providers: [
        { provide: ViewportService, useValue: { isMobile } },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
      ],
    }).compileComponents();
  });

  it('[669-unify-mobile-detection-and-touch-targets/AC-5] gives the card actions of the table with actions a 48 by 48 tap area', () => {
    // GIVEN the table with actions showing a student with two icon actions, on a 375px wide screen
    // WHEN the cards are shown
    const host = tableWithActions(true).nativeElement as HTMLElement;

    // THEN the tap area of each action is at least 48 pixels wide and 48 pixels high
    const cards = Array.from(host.querySelectorAll('mat-card'));
    expect(cards.length).toBe(rows.length);
    cards.forEach(card => {
      const buttons = Array.from(
        card.querySelectorAll<HTMLElement>('app-action-button button')
      );
      expect(buttons.length).toBe(actions.length);
      const areas = buttons.map(button => rect(touchTargetOf(button)));
      areas.forEach(area => {
        expect(area.width).toBeGreaterThanOrEqual(MIN_TAP);
        expect(area.height).toBeGreaterThanOrEqual(MIN_TAP);
      });
      // AND the tap areas do not overlap each other
      expect(areas[1].left).toBeGreaterThanOrEqual(areas[0].right - 0.5);
      // AND only the tap area is bigger: the visible button keeps its size and the card its height
      buttons.forEach(button => {
        expect(rect(button).height).toBe(BUTTON_HEIGHT);
        expect(getComputedStyle(touchTargetOf(button)).position).toBe(
          'absolute'
        );
      });
    });
  });

  it('[669-unify-mobile-detection-and-touch-targets/AC-6] gives the detail button of the table with redirect a 48 by 48 tap area', () => {
    // GIVEN the table with redirect showing a row with its detail button, on a 375px wide screen
    // WHEN the card is shown
    const host = tableWithRedirect(true).nativeElement as HTMLElement;

    // THEN the tap area of the detail button is at least 48 pixels wide and 48 pixels high
    const buttons = Array.from(
      host.querySelectorAll<HTMLElement>('mat-card button')
    );
    expect(buttons.length).toBe(rows.length);
    buttons.forEach(button => {
      const area = rect(touchTargetOf(button));
      expect(area.width).toBeGreaterThanOrEqual(MIN_TAP);
      expect(area.height).toBeGreaterThanOrEqual(MIN_TAP);
      // AND the card keeps its height
      expect(rect(button).height).toBe(BUTTON_HEIGHT);
      expect(getComputedStyle(touchTargetOf(button)).position).toBe('absolute');
    });
  });

  it('[669-unify-mobile-detection-and-touch-targets/AC-7] keeps the size of the table controls and rows on a desktop screen', () => {
    // GIVEN both tables showing rows with their action controls, on a 1280px wide screen
    // WHEN the tables are shown
    const sizesOf = (host: HTMLElement) => ({
      controls: Array.from(host.querySelectorAll<HTMLElement>('td button')).map(
        control => [rect(control).width, rect(control).height]
      ),
      rows: Array.from(host.querySelectorAll('tr.mat-mdc-row')).map(
        row => rect(row).height
      ),
    });
    const actions = sizesOf(tableWithActions(false).nativeElement);
    const redirect = sizesOf(tableWithRedirect(false).nativeElement);

    // THEN no control is enlarged: each one keeps its standard Material size
    expect(actions.controls).toEqual(
      rows.map(() => [BUTTON_HEIGHT, BUTTON_HEIGHT])
    );
    expect(redirect.controls).toEqual(
      rows.map(() => [BUTTON_HEIGHT, BUTTON_HEIGHT])
    );
    // AND the rows keep their current height
    expect(actions.rows).toEqual(rows.map(() => ACTIONS_ROW_HEIGHT));
    expect(redirect.rows).toEqual(rows.map(() => REDIRECT_ROW_HEIGHT));
  });
});
