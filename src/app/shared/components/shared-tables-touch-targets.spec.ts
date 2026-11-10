import { Component, signal, WritableSignal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
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

// The only number of the spec (AC-5, AC-6): the minimum tap area, in pixels.
const MIN_TAP = 48;

@Component({
  selector: 'app-reference-button',
  imports: [MatIconButton],
  template: '<button mat-icon-button>x</button>',
})
class ReferenceButtonComponent {}

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

  const heightOf = (element: Element) => rect(element).height;

  // Height of an element as the layout sees it: with the invisible touch targets hidden, so a
  // touch target that takes room in the layout shows up as a difference.
  const heightIgnoringTouchTargets = (host: HTMLElement, element: Element) => {
    const targets = Array.from(
      host.querySelectorAll<HTMLElement>('.mat-mdc-button-touch-target')
    );
    targets.forEach(target => (target.style.display = 'none'));
    const height = rect(element).height;
    targets.forEach(target => (target.style.display = ''));
    return height;
  };

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
    const visibleHeights: number[] = [];
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
      // AND the card keeps its height: the tap areas take no room in the layout
      expect(rect(card).height).toBeCloseTo(
        heightIgnoringTouchTargets(host, card),
        1
      );
      visibleHeights.push(...buttons.map(heightOf));
    });

    // AND only the tap area is bigger: the visible actions are as high as the ones on desktop
    const desktop = tableWithActions(false).nativeElement as HTMLElement;
    const desktopHeights = Array.from(
      desktop.querySelectorAll<HTMLElement>('td button')
    ).map(heightOf);
    expect(desktopHeights.length).toBeGreaterThan(0);
    visibleHeights.forEach(height => expect(height).toBe(desktopHeights[0]));
  });

  it('[669-unify-mobile-detection-and-touch-targets/AC-6] gives the detail button of the table with redirect a 48 by 48 tap area', () => {
    // GIVEN the table with redirect showing a row with its detail button, on a 375px wide screen
    // WHEN the card is shown
    const host = tableWithRedirect(true).nativeElement as HTMLElement;

    // THEN the tap area of the detail button is at least 48 pixels wide and 48 pixels high
    const cards = Array.from(host.querySelectorAll('mat-card'));
    expect(cards.length).toBe(rows.length);
    const visibleHeights: number[] = [];
    cards.forEach(card => {
      const button = card.querySelector<HTMLElement>('button')!;
      const area = rect(touchTargetOf(button));
      expect(area.width).toBeGreaterThanOrEqual(MIN_TAP);
      expect(area.height).toBeGreaterThanOrEqual(MIN_TAP);
      // AND the card keeps its height: the tap area takes no room in the layout
      expect(rect(card).height).toBeCloseTo(
        heightIgnoringTouchTargets(host, card),
        1
      );
      visibleHeights.push(heightOf(button));
    });

    // AND only the tap area is bigger: the visible button is as high as the one on desktop
    const desktop = tableWithRedirect(false).nativeElement as HTMLElement;
    const desktopHeights = Array.from(
      desktop.querySelectorAll<HTMLElement>('td button')
    ).map(heightOf);
    expect(desktopHeights.length).toBeGreaterThan(0);
    visibleHeights.forEach(height => expect(height).toBe(desktopHeights[0]));
  });

  it('[669-unify-mobile-detection-and-touch-targets/AC-7] keeps the size of the table controls and rows on a desktop screen', () => {
    // GIVEN both tables showing rows with their action controls, on a 1280px wide screen
    // (a new fixture replaces the previous one in the document, so each is measured when shown)
    const reference = TestBed.createComponent(ReferenceButtonComponent);
    reference.detectChanges();
    const standardHeight = heightOf(
      reference.nativeElement.querySelector('button')
    );

    // WHEN the tables are shown
    const measure = (host: HTMLElement) => ({
      controls: Array.from(host.querySelectorAll<HTMLElement>('td button')).map(
        heightOf
      ),
      rows: Array.from(host.querySelectorAll('tr.mat-mdc-row')).map(row => [
        heightOf(row),
        heightIgnoringTouchTargets(host, row),
      ]),
    });
    const measured = [
      measure(tableWithActions(false).nativeElement),
      measure(tableWithRedirect(false).nativeElement),
    ];

    measured.forEach(({ controls, rows: tableRows }) => {
      expect(controls.length).toBeGreaterThan(0);
      expect(tableRows.length).toBe(rows.length);
      // THEN no control is enlarged: each one is as high as a standard Material icon button
      controls.forEach(height => expect(height).toBe(standardHeight));
      // AND the rows keep their current height: the controls take no room beyond their own box
      tableRows.forEach(([height, withoutTouchTargets]) =>
        expect(height).toBeCloseTo(withoutTouchTargets, 1)
      );
    });
  });
});
